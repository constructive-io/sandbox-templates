-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table


GRANT DELETE ON myapp_events_public.app_achievement_rewards TO authenticated;

