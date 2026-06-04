-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/triggers/org_event_aggregates_after_insert_update_tgr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/trigger_fns/member_tg_chk_achv
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table


CREATE TRIGGER org_event_aggregates_after_insert_update_tgr
AFTER INSERT OR UPDATE ON myapp_events_public.org_event_aggregates
FOR EACH ROW
EXECUTE PROCEDURE myapp_events_private.member_tg_chk_achv ( );

