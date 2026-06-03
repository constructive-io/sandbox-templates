-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/column


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP COLUMN is_active RESTRICT;


