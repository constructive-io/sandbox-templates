-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/columns/entity_id/alterations/alt0000000154


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN entity_id DROP NOT NULL;


