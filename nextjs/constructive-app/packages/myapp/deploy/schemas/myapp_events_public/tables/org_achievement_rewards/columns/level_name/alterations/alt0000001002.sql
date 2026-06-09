-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/alterations/alt0000001002
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/level_name/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN level_name SET NOT NULL;

