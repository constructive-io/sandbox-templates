-- Revert: schemas/myapp_store_public/tables/app_config_definitions/policies/enable_row_level_security


ALTER TABLE myapp_store_public.app_config_definitions 
  DISABLE ROW LEVEL SECURITY;


