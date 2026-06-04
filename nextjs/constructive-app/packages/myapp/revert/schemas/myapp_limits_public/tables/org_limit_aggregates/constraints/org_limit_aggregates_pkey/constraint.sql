-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/constraints/org_limit_aggregates_pkey/constraint


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  DROP CONSTRAINT org_limit_aggregates_pkey;


