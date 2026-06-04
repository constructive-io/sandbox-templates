-- Revert: schemas/myapp_limits_public/tables/org_limit_defaults/constraints/org_limit_defaults_pkey/constraint


ALTER TABLE myapp_limits_public.org_limit_defaults 
  DROP CONSTRAINT org_limit_defaults_pkey;


