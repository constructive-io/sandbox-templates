-- Verify: schemas/myapp_events_public/tables/app_event_aggregates/triggers/timestamps_tg


SELECT verify_trigger('myapp_events_public.timestamps_tg');


