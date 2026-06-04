-- Deploy: schemas/myapp_limits_public/tables/org_limit_warnings/columns/name/alterations/alt0000000592
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/table
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/columns/name/column


ALTER TABLE myapp_limits_public.org_limit_warnings 
  ALTER COLUMN name SET NOT NULL;

