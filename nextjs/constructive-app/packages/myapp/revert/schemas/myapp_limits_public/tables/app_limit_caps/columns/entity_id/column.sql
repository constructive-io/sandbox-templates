-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/columns/entity_id/column


ALTER TABLE myapp_limits_public.app_limit_caps 
  DROP COLUMN entity_id RESTRICT;


