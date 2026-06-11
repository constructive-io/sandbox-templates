-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/constraints/app_limit_caps_defaults_pkey/constraint


ALTER TABLE myapp_limits_public.app_limit_caps_defaults 
  DROP CONSTRAINT app_limit_caps_defaults_pkey;


