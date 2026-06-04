-- Deploy: schemas/myapp_events_public/tables/org_level_grants/triggers/org_level_grants_after_insert_reward_tgr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table
-- requires: schemas/myapp_events_private/trigger_fns/member_tg_achv_rwd


CREATE TRIGGER org_level_grants_after_insert_reward_tgr
AFTER INSERT ON myapp_events_public.org_level_grants
FOR EACH ROW
EXECUTE PROCEDURE myapp_events_private.member_tg_achv_rwd ( );

