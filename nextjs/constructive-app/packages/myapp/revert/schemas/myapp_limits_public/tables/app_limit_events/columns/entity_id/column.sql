-- Revert: schemas/myapp_limits_public/tables/app_limit_events/columns/entity_id/column


ALTER TABLE myapp_limits_public.app_limit_events 
  DROP COLUMN entity_id RESTRICT;


