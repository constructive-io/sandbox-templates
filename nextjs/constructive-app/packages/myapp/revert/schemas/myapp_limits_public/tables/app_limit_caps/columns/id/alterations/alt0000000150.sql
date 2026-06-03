-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/columns/id/alterations/alt0000000150


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN id DROP NOT NULL;


