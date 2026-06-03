-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/network_egress_bytes/column


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP COLUMN network_egress_bytes RESTRICT;


