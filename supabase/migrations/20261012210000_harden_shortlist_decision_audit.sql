begin;

-- A decision's editor must be the currently authenticated database user.
drop policy if exists shortlist_decisions_org_access
    on public.shortlist_decisions;

create policy shortlist_decisions_org_access
    on public.shortlist_decisions
    for all
    to authenticated
    using (
        organization_id is not null
        and exists (
            select 1
            from public.memberships as m
            where m.user_id = (
                select public.current_app_user_id()
            )
            and m.organization_id =
                shortlist_decisions.organization_id
        )
        and exists (
            select 1
            from public.jobs as j
            where j.id = shortlist_decisions.job_id
            and j.organization_id =
                shortlist_decisions.organization_id
        )
        and exists (
            select 1
            from public.candidates as c
            where c.id = shortlist_decisions.candidate_id
            and c.organization_id =
                shortlist_decisions.organization_id
        )
    )
    with check (
        organization_id is not null
        and decided_by = (
            select public.current_app_user_id()
        )
        and exists (
            select 1
            from public.memberships as m
            where m.user_id = (
                select public.current_app_user_id()
            )
            and m.organization_id =
                shortlist_decisions.organization_id
        )
        and exists (
            select 1
            from public.jobs as j
            where j.id = shortlist_decisions.job_id
            and j.organization_id =
                shortlist_decisions.organization_id
        )
        and exists (
            select 1
            from public.candidates as c
            where c.id = shortlist_decisions.candidate_id
            and c.organization_id =
                shortlist_decisions.organization_id
        )
    );

-- Let PostgreSQL maintain timestamps, avoiding client/database clock drift.
drop trigger if exists shortlist_decisions_set_updated_at
    on public.shortlist_decisions;

create trigger shortlist_decisions_set_updated_at
    before insert or update
    on public.shortlist_decisions
    for each row
    execute function public.update_updated_at_column();

commit;