-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/columns/task_identifier/alterations/alt0000000169
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/table
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/columns/task_identifier/column


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN task_identifier SET NOT NULL;

