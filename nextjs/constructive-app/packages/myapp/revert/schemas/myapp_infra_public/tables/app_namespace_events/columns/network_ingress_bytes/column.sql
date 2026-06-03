-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/network_ingress_bytes/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP COLUMN network_ingress_bytes RESTRICT;


