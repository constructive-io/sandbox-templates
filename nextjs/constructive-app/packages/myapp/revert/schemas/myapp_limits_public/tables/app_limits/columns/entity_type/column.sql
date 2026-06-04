-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/entity_type/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN entity_type RESTRICT;


