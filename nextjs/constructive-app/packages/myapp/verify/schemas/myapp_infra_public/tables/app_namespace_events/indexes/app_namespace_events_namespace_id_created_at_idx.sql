-- Verify: schemas/myapp_infra_public/tables/app_namespace_events/indexes/app_namespace_events_namespace_id_created_at_idx


SELECT verify_index('myapp_infra_public.app_namespace_events', 'app_namespace_events_namespace_id_created_at_idx');


