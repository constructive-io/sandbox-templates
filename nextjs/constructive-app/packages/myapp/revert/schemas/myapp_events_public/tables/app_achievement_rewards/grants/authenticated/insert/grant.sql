-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_events_public.app_achievement_rewards FROM authenticated;


