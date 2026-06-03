-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/alterations/alt0000001349


ALTER TABLE myapp_infra_public.app_namespace_events 
  ALTER COLUMN event_type DROP NOT NULL;


