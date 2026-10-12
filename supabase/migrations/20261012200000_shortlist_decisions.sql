begin;

create table if not exists public.shortlist_decisions (
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null
        references public.organizations(id)
        on delete cascade,

    job_id uuid not null
        references public.jobs(id)
        on delete cascade,

    candidate_id uuid not null
        references public.candidates(id)
        on delete cascade,

    decision text not null
        check (decision in ('shortlist', 'review', 'decline')),

    decided_by uuid
        references public.users(id)
        on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint shortlist_decisions_one_per_job_candidate
        unique (job_id, candidate_id)
);

create index if not exists idx_shortlist_decisions_org_job
    on public.shortlist_decisions (organization_id, job_id);

create index if not exists idx_shortlist_decisions_candidate
    on public.shortlist_decisions (candidate_id);

alter table public.shortlist_decisions
    enable row level security;

revoke all privileges
    on table public.shortlist_decisions
    from anon;

revoke all privileges
    on table public.shortlist_decisions
    from authenticated;

grant select, insert, update, delete
    on table public.shortlist_decisions
    to authenticated;

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

commit;