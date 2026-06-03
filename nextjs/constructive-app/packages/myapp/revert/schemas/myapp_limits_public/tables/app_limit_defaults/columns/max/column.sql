-- Revert: schemas/myapp_limits_public/tables/app_limit_defaults/columns/max/column


ALTER TABLE myapp_limits_public.app_limit_defaults 
  DROP COLUMN max RESTRICT;


