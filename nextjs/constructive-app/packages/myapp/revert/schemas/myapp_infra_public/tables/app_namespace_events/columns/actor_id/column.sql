-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/actor_id/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP COLUMN actor_id RESTRICT;


