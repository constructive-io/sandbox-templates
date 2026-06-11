-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/updated_at/column


ALTER TABLE myapp_infra_public.app_namespaces 
  DROP COLUMN updated_at RESTRICT;


