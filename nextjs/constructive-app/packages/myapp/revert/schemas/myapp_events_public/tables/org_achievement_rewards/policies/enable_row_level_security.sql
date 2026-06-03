-- Revert: schemas/myapp_events_public/tables/org_achievement_rewards/policies/enable_row_level_security


ALTER TABLE myapp_events_public.org_achievement_rewards 
  DISABLE ROW LEVEL SECURITY;


