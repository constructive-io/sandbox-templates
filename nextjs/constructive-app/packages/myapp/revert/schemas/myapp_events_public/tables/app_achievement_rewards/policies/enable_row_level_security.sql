-- Revert: schemas/myapp_events_public/tables/app_achievement_rewards/policies/enable_row_level_security


ALTER TABLE myapp_events_public.app_achievement_rewards 
  DISABLE ROW LEVEL SECURITY;


