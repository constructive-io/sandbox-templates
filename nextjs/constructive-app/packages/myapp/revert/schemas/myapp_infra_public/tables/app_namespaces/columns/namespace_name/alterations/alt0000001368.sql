-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/namespace_name/alterations/alt0000001368


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN namespace_name DROP NOT NULL;


