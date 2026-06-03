-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/columns/id/alterations/alt0000000161
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/table
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/columns/id/column


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN id SET NOT NULL;

