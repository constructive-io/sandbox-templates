-- Deploy: schemas/myapp_events_public/tables/app_event_aggregates/triggers/app_event_aggregates_after_insert_update_tgr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/trigger_fns/tg_chk_achv
-- requires: schemas/myapp_events_public/tables/app_event_aggregates/table


CREATE TRIGGER app_event_aggregates_after_insert_update_tgr
AFTER INSERT OR UPDATE ON myapp_events_public.app_event_aggregates
FOR EACH ROW
EXECUTE PROCEDURE myapp_events_private.tg_chk_achv ( );

