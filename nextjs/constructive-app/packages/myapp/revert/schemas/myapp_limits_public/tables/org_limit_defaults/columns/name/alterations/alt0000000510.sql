-- Revert: schemas/myapp_limits_public/tables/org_limit_defaults/columns/name/alterations/alt0000000510


ALTER TABLE myapp_limits_public.org_limit_defaults 
  ALTER COLUMN name DROP NOT NULL;


