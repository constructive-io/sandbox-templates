-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/warning_type/alterations/alt0000000594


ALTER TABLE myapp_limits_public.org_limit_warnings 
  ALTER COLUMN warning_type DROP NOT NULL;


