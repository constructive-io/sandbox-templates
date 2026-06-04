-- Deploy: schemas/myapp_events_public/tables/org_events/triggers/org_events_after_insert_tgr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_events/table
-- requires: schemas/myapp_events_private/trigger_fns/member_tg_upd_aggr


CREATE TRIGGER org_events_after_insert_tgr
AFTER INSERT ON myapp_events_public.org_events
FOR EACH ROW
EXECUTE PROCEDURE myapp_events_private.member_tg_upd_aggr ( );

