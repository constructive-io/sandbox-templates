-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/annotations/alterations/alt0000001339


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN annotations DROP DEFAULT;


