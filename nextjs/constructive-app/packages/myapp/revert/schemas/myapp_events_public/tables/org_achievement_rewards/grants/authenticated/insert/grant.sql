-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.org_achievement_rewards FROM authenticated;


