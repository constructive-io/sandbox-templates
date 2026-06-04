-- Verify: schemas/myapp_events_public/tables/app_achievement_rewards/policies/auth_sel_all_all/policy


SELECT verify_policy('auth_sel_all_all', 'myapp_events_public.app_achievement_rewards');


