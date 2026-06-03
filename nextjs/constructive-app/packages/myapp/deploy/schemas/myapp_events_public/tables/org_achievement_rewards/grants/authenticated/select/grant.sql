-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table


GRANT SELECT ON myapp_events_public.org_achievement_rewards TO authenticated;

