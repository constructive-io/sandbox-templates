-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/constraints/app_namespace_events_pkey/constraint


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP CONSTRAINT app_namespace_events_pkey;


