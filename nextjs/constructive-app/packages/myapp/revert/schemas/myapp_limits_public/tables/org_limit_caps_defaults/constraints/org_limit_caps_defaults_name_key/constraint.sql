-- Revert: schemas/myapp_limits_public/tables/org_limit_caps_defaults/constraints/org_limit_caps_defaults_name_key/constraint


ALTER TABLE myapp_limits_public.org_limit_caps_defaults 
  DROP CONSTRAINT org_limit_caps_defaults_name_key;


