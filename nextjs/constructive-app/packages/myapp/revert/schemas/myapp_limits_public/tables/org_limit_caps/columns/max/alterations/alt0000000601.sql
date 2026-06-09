-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/columns/max/alterations/alt0000000601


ALTER TABLE myapp_limits_public.org_limit_caps 
  ALTER COLUMN max DROP DEFAULT;


