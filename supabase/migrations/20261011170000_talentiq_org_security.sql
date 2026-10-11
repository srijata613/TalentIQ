-- TalentIQ organization-scoped RLS and Storage policies
-- STATUS: REVIEWED DRAFT ONLY. Do NOT apply until the complete app flow has been tested and approved.
-- Run as a single transaction in a controlled maintenance window.
-- Preserves table rows and Storage objects. Does not change service_role grants or delete objects.

begin;

-- 1) Identity and organization helpers. Clerk is the identity provider, so the trusted JWT subject
-- maps to public.users.clerk_user_id (confirmed by the application's working Clerk/Supabase test).
create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from public.users as u
  where u.clerk_user_id = (select auth.jwt() ->> 'sub')
  limit 1;
$$;

-- New uploads must use <organization-uuid>/<unique-filename> paths.
-- The CASE prevents a cast attempt for existing flat filenames.
create or replace function public.current_app_organization_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_membership_count integer;
begin
  v_user_id := public.current_app_user_id();
  if v_user_id is null then
    raise exception 'Database user is not synced';
  end if;

  select count(distinct m.organization_id), min(m.organization_id::text)::uuid
    into v_membership_count, v_organization_id
  from public.memberships as m
  where m.user_id = v_user_id
    and m.organization_id is not null;

  if v_membership_count = 0 then
    raise exception 'User does not belong to an organization';
  end if;

  if v_membership_count > 1 then
    raise exception 'Multiple organization memberships require an active organization selector';
  end if;

  return v_organization_id;
end;
$$;

-- Organization creation must create the organization and its first owner membership atomically.
-- Lock the unique user row before checking memberships so concurrent requests cannot create
-- two organizations for the same user under the single-organization model.
-- The frontend createOrganization action must call this RPC instead of inserting both tables directly.
create or replace function public.create_organization(p_name text, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_name text;
  v_slug text;
  v_org public.organizations%rowtype;
begin
  if (select auth.jwt() ->> 'sub') is null then
    raise exception 'Unauthorized';
  end if;

  select u.id into v_user_id
  from public.users as u
  where u.clerk_user_id = (select auth.jwt() ->> 'sub')
  for update;

  if v_user_id is null then
    raise exception 'Database user is not synced';
  end if;

  if exists (select 1 from public.memberships as m where m.user_id = v_user_id) then
    raise exception 'User already belongs to an organization';
  end if;

  v_name := btrim(coalesce(p_name, ''));
  v_slug := lower(btrim(coalesce(p_slug, '')));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'Organization name must be between 2 and 120 characters';
  end if;
  if v_slug = '' or char_length(v_slug) > 120 then
    raise exception 'A valid organization slug could not be generated';
  end if;

  insert into public.organizations (name, slug)
  values (v_name, v_slug)
  returning * into v_org;

  insert into public.memberships (user_id, organization_id, role)
  values (v_user_id, v_org.id, 'owner');

  return to_jsonb(v_org);
end;
$$;

-- 2) Remove existing policies on the audited app tables so no permissive policy remains alongside
-- the restrictive organization-scoped policies below.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'candidate_matches', 'candidates', 'job_analysis', 'job_templates', 'job_versions',
        'jobs', 'memberships', 'organizations', 'taxonomy_aliases', 'taxonomy_entities', 'users'
      ])
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end;
$$;

-- Storage had permissive development policies. Remove policies on storage.objects before replacing
-- them so permissive policies cannot OR-open access. This affects policies, not stored objects.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end;
$$;

-- 3) Least-privilege SQL grants. service_role grants are deliberately untouched.
revoke all privileges on table
  public.candidate_matches, public.candidates, public.job_analysis, public.job_templates,
  public.job_versions, public.jobs, public.memberships, public.organizations,
  public.taxonomy_aliases, public.taxonomy_entities, public.users
from anon;

revoke all privileges on table
  public.candidate_matches, public.candidates, public.job_analysis, public.job_templates,
  public.job_versions, public.jobs, public.memberships, public.organizations,
  public.taxonomy_aliases, public.taxonomy_entities, public.users
from authenticated;

grant select on table public.users to authenticated;
-- The application creates its own Clerk mapping and may update only profile fields.
-- Column-level grants prevent clients from choosing/changing internal IDs or timestamps.
grant insert (clerk_user_id, email, full_name, avatar_url) on table public.users to authenticated;
grant update (email, full_name, avatar_url) on table public.users to authenticated;
grant select on table public.organizations to authenticated;
grant select on table public.memberships to authenticated;
grant select, insert, update, delete on table public.candidates to authenticated;
grant select, insert, update, delete on table public.jobs to authenticated;
grant select, insert, update, delete on table public.job_versions to authenticated;
grant select, insert, update, delete on table public.job_analysis to authenticated;
grant select, insert, delete on table public.candidate_matches to authenticated;
grant select on table public.job_templates to authenticated;
grant select on table public.taxonomy_aliases, public.taxonomy_entities to authenticated;

-- Keep Storage API's ordinary CRUD operations available to authenticated users,
-- but remove all anon access and non-CRUD privileges that can bypass RLS or are not needed.
revoke all privileges on table storage.objects from anon;
revoke all privileges on table storage.objects from authenticated;
grant select, insert, update, delete on table storage.objects to authenticated;

revoke all on function public.current_app_user_id() from public, anon;
revoke all on function public.current_app_organization_id() from public, anon;
revoke all on function public.create_organization(text, text) from public, anon;
grant execute on function public.current_app_user_id() to authenticated;
grant execute on function public.current_app_organization_id() to authenticated;
grant execute on function public.create_organization(text, text) to authenticated;

-- 4) Public table RLS policies.
create policy users_select_self on public.users
  for select to authenticated
  using (clerk_user_id = (select auth.jwt() ->> 'sub'));
create policy users_insert_self on public.users
  for insert to authenticated
  with check (clerk_user_id = (select auth.jwt() ->> 'sub'));
create policy users_update_self on public.users
  for update to authenticated
  using (clerk_user_id = (select auth.jwt() ->> 'sub'))
  with check (clerk_user_id = (select auth.jwt() ->> 'sub'));

create policy memberships_select_self on public.memberships
  for select to authenticated
  using (user_id = (select public.current_app_user_id()));

create policy organizations_select_member on public.organizations
  for select to authenticated
  using (
    exists (
      select 1 from public.memberships as m
      where m.user_id = (select public.current_app_user_id())
        and m.organization_id = organizations.id
    )
  );

create policy candidates_org_access on public.candidates
  for all to authenticated
  using (
    organization_id is not null
    and exists (
      select 1 from public.memberships as m
      where m.user_id = (select public.current_app_user_id())
        and m.organization_id = candidates.organization_id
    )
  )
  with check (
    organization_id is not null
    and exists (
      select 1 from public.memberships as m
      where m.user_id = (select public.current_app_user_id())
        and m.organization_id = candidates.organization_id
    )
  );

create policy jobs_org_access on public.jobs
  for all to authenticated
  using (
    organization_id is not null
    and exists (
      select 1 from public.memberships as m
      where m.user_id = (select public.current_app_user_id())
        and m.organization_id = jobs.organization_id
    )
  )
  with check (
    organization_id is not null
    and exists (
      select 1 from public.memberships as m
      where m.user_id = (select public.current_app_user_id())
        and m.organization_id = jobs.organization_id
    )
  );

create policy job_versions_org_access on public.job_versions
  for all to authenticated
  using (
    exists (
      select 1 from public.jobs as j
      where j.id = job_versions.job_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  )
  with check (
    exists (
      select 1 from public.jobs as j
      where j.id = job_versions.job_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  );

create policy job_analysis_org_access on public.job_analysis
  for all to authenticated
  using (
    exists (
      select 1 from public.jobs as j
      where j.id = job_analysis.job_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  )
  with check (
    exists (
      select 1 from public.jobs as j
      where j.id = job_analysis.job_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  );

create policy candidate_matches_select_org on public.candidate_matches
  for select to authenticated
  using (
    exists (
      select 1
      from public.jobs as j
      join public.candidates as c on c.id = candidate_matches.candidate_id
      where j.id = candidate_matches.job_id
        and j.organization_id = c.organization_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  );
create policy candidate_matches_insert_org on public.candidate_matches
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.jobs as j
      join public.candidates as c on c.id = candidate_matches.candidate_id
      where j.id = candidate_matches.job_id
        and j.organization_id = c.organization_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  );
create policy candidate_matches_delete_org on public.candidate_matches
  for delete to authenticated
  using (
    exists (
      select 1
      from public.jobs as j
      join public.candidates as c on c.id = candidate_matches.candidate_id
      where j.id = candidate_matches.job_id
        and j.organization_id = c.organization_id
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  );

-- Shared reference data is readable only to authenticated application users; app clients cannot mutate it.
create policy job_templates_select_authenticated on public.job_templates
  for select to authenticated using (true);
create policy taxonomy_aliases_select_authenticated on public.taxonomy_aliases
  for select to authenticated using (true);
create policy taxonomy_entities_select_authenticated on public.taxonomy_entities
  for select to authenticated using (true);

-- 5) Storage policies. Existing flat-path objects stay in storage and can be read only when linked
-- to a candidate/job row the user can access. New uploads must use <organization-uuid>/<filename>.
create policy resumes_select_org_referenced on storage.objects
  for select to authenticated
  using (
    bucket_id = 'resumes'
    and exists (
      select 1 from public.candidates as c
      where c.resume_storage_path = storage.objects.name
        and c.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = c.organization_id
        )
    )
  );

create policy job_descriptions_select_org_referenced on storage.objects
  for select to authenticated
  using (
    bucket_id = 'job-descriptions'
    and exists (
      select 1 from public.jobs as j
      where j.jd_storage_path = storage.objects.name
        and j.organization_id is not null
        and exists (
          select 1 from public.memberships as m
          where m.user_id = (select public.current_app_user_id())
            and m.organization_id = j.organization_id
        )
    )
  );

create policy org_members_upload_files on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('resumes', 'job-descriptions')
    and case
      when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then exists (
        select 1 from public.memberships as m
        where m.user_id = (select public.current_app_user_id())
          and m.organization_id = split_part(name, '/', 1)::uuid
      )
      else false
    end
  );

-- Intentionally no authenticated UPDATE/DELETE policies for Storage in this first pass.
-- This prevents accidental overwrites/deletions, including unreferenced backup objects.

commit;

-- Post-apply verification (run separately after the application code is updated):
-- 1) Ensure no permissive dev_* policies remain on the 11 public tables or storage.objects.
-- 2) Confirm counts of public rows and storage.objects match pre-migration counts.
-- 3) Test owner access, cross-organization denial, uploads under org-prefixed paths, and signed URLs.
