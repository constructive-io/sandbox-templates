-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/message/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP COLUMN message RESTRICT;


