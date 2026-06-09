-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/columns/name/alterations/alt0000000596


ALTER TABLE myapp_limits_public.org_limit_caps 
  ALTER COLUMN name DROP NOT NULL;


