-- Revert: schemas/myapp_limits_public/tables/app_limit_caps_defaults/policies/enable_row_level_security


ALTER TABLE myapp_limits_public.app_limit_caps_defaults 
  DISABLE ROW LEVEL SECURITY;


