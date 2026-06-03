-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/metrics/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP COLUMN metrics RESTRICT;


