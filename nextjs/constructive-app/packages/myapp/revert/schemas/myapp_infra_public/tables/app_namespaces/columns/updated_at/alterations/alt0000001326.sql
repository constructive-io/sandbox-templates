-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/updated_at/alterations/alt0000001326


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN updated_at DROP DEFAULT;


