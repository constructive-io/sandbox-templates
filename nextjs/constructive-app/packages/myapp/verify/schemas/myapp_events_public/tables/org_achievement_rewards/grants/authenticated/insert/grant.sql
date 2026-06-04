-- Verify: schemas/myapp_events_public/tables/org_achievement_rewards/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_events_public.org_achievement_rewards', 'insert', 'authenticated');


