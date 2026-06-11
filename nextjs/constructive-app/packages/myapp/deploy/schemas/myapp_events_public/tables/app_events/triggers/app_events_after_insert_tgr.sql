-- Deploy: schemas/myapp_events_public/tables/app_events/triggers/app_events_after_insert_tgr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/app_events/table
-- requires: schemas/myapp_events_private/trigger_fns/tg_upd_aggr


CREATE TRIGGER app_events_after_insert_tgr
AFTER INSERT ON myapp_events_public.app_events
FOR EACH ROW
EXECUTE PROCEDURE myapp_events_private.tg_upd_aggr ( );

