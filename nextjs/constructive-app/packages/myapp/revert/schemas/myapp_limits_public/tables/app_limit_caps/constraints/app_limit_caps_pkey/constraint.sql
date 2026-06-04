-- Revert: schemas/myapp_limits_public/tables/app_limit_caps/constraints/app_limit_caps_pkey/constraint


ALTER TABLE myapp_limits_public.app_limit_caps 
  DROP CONSTRAINT app_limit_caps_pkey;


