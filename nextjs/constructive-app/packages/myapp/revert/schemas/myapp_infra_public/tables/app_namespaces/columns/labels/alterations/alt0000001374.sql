-- Revert: schemas/myapp_infra_public/tables/app_namespaces/columns/labels/alterations/alt0000001374


ALTER TABLE myapp_infra_public.app_namespaces 
  ALTER COLUMN labels DROP NOT NULL;


