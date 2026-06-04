-- Verify: schemas/myapp_events_public/tables/app_achievement_rewards/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_events_public.app_achievement_rewards', 'select', 'authenticated');


