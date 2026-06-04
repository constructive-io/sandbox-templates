-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/policies/enable_row_level_security


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  DISABLE ROW LEVEL SECURITY;


