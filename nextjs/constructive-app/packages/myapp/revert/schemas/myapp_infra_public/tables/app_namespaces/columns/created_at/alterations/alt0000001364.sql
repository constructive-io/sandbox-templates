-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/created_at/alterations/alt0000001364


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN created_at DROP DEFAULT;


