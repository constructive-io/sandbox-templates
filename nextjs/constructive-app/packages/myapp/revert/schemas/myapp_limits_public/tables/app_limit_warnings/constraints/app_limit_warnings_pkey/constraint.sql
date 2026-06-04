-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/constraints/app_limit_warnings_pkey/constraint


ALTER TABLE myapp_limits_public.app_limit_warnings 
  DROP CONSTRAINT app_limit_warnings_pkey;


