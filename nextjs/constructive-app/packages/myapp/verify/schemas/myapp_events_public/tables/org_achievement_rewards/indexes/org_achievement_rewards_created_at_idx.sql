-- Verify: schemas/myapp_events_public/tables/org_achievement_rewards/indexes/org_achievement_rewards_created_at_idx


SELECT verify_index('myapp_events_public.org_achievement_rewards', 'org_achievement_rewards_created_at_idx');


