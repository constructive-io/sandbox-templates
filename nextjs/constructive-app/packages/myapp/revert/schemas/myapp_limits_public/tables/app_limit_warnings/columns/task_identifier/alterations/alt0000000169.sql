-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/task_identifier/alterations/alt0000000169


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN task_identifier DROP NOT NULL;


