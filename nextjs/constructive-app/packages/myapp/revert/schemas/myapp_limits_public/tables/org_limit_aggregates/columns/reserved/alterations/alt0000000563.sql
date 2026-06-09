-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/reserved/alterations/alt0000000563


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN reserved DROP DEFAULT;


