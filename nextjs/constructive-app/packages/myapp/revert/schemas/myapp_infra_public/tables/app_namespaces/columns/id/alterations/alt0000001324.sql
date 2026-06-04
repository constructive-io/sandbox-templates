-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/id/alterations/alt0000001324


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN id DROP DEFAULT;


