-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/namespace_id/alterations/alt0000001386


ALTER TABLE myapp_infra_public.app_namespace_events 
  ALTER COLUMN namespace_id DROP NOT NULL;


