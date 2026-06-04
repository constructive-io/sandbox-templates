-- Deploy: schemas/myapp_events_public/tables/app_level_grants/triggers/app_level_grants_after_insert_reward_tgr
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_events_private/trigger_fns/tg_achv_rwd
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


CREATE TRIGGER app_level_grants_after_insert_reward_tgr
AFTER INSERT ON myapp_events_public.app_level_grants
FOR EACH ROW
EXECUTE PROCEDURE myapp_events_private.tg_achv_rwd ( );

