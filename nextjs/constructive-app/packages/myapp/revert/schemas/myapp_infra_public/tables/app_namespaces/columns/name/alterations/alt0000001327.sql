-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/name/alterations/alt0000001327


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN name DROP NOT NULL;


