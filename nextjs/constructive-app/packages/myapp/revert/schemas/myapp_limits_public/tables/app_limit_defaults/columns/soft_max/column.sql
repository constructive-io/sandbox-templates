-- Revert: schemas/myapp_limits_public/tables/app_limit_defaults/columns/soft_max/column


ALTER TABLE myapp_limits_public.app_limit_defaults 
  DROP COLUMN soft_max RESTRICT;


