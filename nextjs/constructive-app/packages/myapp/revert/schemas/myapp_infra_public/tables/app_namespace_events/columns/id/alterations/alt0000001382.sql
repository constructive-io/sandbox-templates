-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/id/alterations/alt0000001382


ALTER TABLE myapp_infra_public.app_namespace_events 
  ALTER COLUMN id DROP NOT NULL;


