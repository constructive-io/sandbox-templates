-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/policies/enable_row_level_security


ALTER TABLE myapp_infra_public.app_namespace_events 
  DISABLE ROW LEVEL SECURITY;


