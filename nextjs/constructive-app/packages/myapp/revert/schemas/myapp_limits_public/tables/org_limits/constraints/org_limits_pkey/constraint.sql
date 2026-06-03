-- Revert: schemas/myapp_limits_public/tables/org_limits/constraints/org_limits_pkey/constraint


ALTER TABLE myapp_limits_public.org_limits 
  DROP CONSTRAINT org_limits_pkey;


