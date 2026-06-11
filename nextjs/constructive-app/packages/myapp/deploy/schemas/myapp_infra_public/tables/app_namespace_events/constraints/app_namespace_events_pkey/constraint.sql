-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/constraints/app_namespace_events_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


ALTER TABLE myapp_infra_public.app_namespace_events 
  ADD CONSTRAINT app_namespace_events_pkey PRIMARY KEY (created_at, id);

