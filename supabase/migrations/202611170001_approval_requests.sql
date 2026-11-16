begin;

create table public.governance_assets (
  id text primary key,
  owner_id uuid not null references auth.users (id),
  revision integer not null check (revision > 0),
  classification text not null check (classification in ('Public', 'Confidential', 'Restricted')),
  status text not null check (status in ('Draft', 'Reviewed', 'Approved', 'Published')),
  pipeline_steps_completed integer not null check (pipeline_steps_completed between 0 and 7)
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id text not null references public.governance_assets (id),
  asset_revision integer not null,
  requested_by uuid not null references auth.users (id),
  requested_at timestamptz not null default now(),
  rule_version text not null,
  verdict text not null check (verdict in ('ok', 'needs_review')),
  reasons text[] not null,
  unique (asset_id, asset_revision, requested_by)
);

alter table public.governance_assets enable row level security;
alter table public.approval_requests enable row level security;
revoke all on public.governance_assets, public.approval_requests from public, anon, authenticated;
grant select on public.approval_requests to authenticated;
grant select, insert, update on public.governance_assets to service_role;

create policy read_own_approval_requests on public.approval_requests
  for select to authenticated using (requested_by = (select auth.uid()));

create function public.request_asset_approval(p_asset_id text, p_asset_revision integer)
returns public.approval_requests
language plpgsql security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  asset public.governance_assets;
  receipt public.approval_requests;
  findings text[] := '{}';
begin
  if caller is null then
    raise exception 'Sign-in required' using errcode = '42501';
  end if;

  select * into asset
  from public.governance_assets
  where id = p_asset_id and owner_id = caller
  for update;
  if not found then
    raise exception 'Asset unavailable' using errcode = 'P0002';
  end if;
  if asset.revision is distinct from p_asset_revision then
    raise exception 'Asset revision changed' using errcode = '40001';
  end if;
  if asset.classification = 'Restricted' and asset.status = 'Published' then
    raise exception 'Restricted data cannot be published' using errcode = '42501';
  end if;

  if asset.classification <> 'Public' then
    if asset.pipeline_steps_completed < 2 and asset.status <> 'Draft' then
      findings := array_append(findings, 'privacy_review_required');
    end if;
    if asset.status = 'Published' and asset.pipeline_steps_completed < 6 then
      findings := array_append(findings, 'legal_approval_required');
    end if;
  end if;

  insert into public.approval_requests (
    asset_id, asset_revision, requested_by, rule_version, verdict, reasons
  )
  values (
    asset.id, asset.revision, caller, 'demo-privacy-v1',
    case when cardinality(findings) > 0 then 'needs_review' else 'ok' end,
    findings
  )
  on conflict (asset_id, asset_revision, requested_by) do nothing
  returning * into receipt;

  if not found then
    select * into strict receipt
    from public.approval_requests
    where asset_id = asset.id and asset_revision = asset.revision and requested_by = caller;
  end if;

  return receipt;
end;
$$;

revoke all on function public.request_asset_approval(text, integer) from public, anon;
grant execute on function public.request_asset_approval(text, integer) to authenticated;

commit;
