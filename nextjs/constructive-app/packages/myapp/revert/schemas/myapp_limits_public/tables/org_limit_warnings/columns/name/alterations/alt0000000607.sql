-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/name/alterations/alt0000000607


ALTER TABLE myapp_limits_public.org_limit_warnings 
  ALTER COLUMN name DROP NOT NULL;


