-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/task_identifier/column


ALTER TABLE myapp_limits_public.org_limit_warnings 
  DROP COLUMN task_identifier RESTRICT;


