-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/id/column


ALTER TABLE myapp_limits_public.org_limit_credits 
  DROP COLUMN id RESTRICT;


