-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/columns/event_type/alterations/alt0000001361


ALTER TABLE myapp_infra_public.app_namespace_events 
  DROP CONSTRAINT app_namespace_events_event_type_chk;


