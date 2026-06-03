-- Revert: schemas/myapp_limits_public/tables/org_limit_credits/columns/default_limit_id/column


ALTER TABLE myapp_limits_public.org_limit_credits 
  DROP COLUMN default_limit_id RESTRICT;


