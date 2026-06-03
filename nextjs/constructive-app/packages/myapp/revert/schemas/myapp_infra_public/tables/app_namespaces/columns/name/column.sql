-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/name/column


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP COLUMN name RESTRICT;


