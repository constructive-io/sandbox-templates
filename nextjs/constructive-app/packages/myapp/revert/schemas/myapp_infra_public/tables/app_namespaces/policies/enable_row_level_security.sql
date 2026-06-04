-- Revert: schemas/myapp_infra_public/tables/app_namespaces/policies/enable_row_level_security


ALTER TABLE myapp_infra_public.app_namespaces 
  DISABLE ROW LEVEL SECURITY;


