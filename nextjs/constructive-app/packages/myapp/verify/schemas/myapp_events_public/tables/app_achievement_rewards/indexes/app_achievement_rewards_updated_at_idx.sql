-- Verify: schemas/myapp_events_public/tables/app_achievement_rewards/indexes/app_achievement_rewards_updated_at_idx


SELECT verify_index('myapp_events_public.app_achievement_rewards', 'app_achievement_rewards_updated_at_idx');


