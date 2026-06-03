-- Verify: schemas/myapp_events_public/tables/org_achievement_rewards/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_events_public.org_achievement_rewards', 'update', 'authenticated');


