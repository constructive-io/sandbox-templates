-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/task_identifier/alterations/alt0000000598


ALTER TABLE myapp_limits_public.org_limit_warnings 
  ALTER COLUMN task_identifier DROP NOT NULL;


