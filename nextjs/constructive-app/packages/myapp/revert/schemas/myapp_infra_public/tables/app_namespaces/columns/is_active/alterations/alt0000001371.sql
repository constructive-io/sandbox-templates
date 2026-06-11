-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/alterations/alt0000001371


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN is_active DROP NOT NULL;


