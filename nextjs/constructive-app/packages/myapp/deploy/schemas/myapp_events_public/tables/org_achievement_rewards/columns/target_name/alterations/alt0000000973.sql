-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/target_name/alterations/alt0000000973
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/target_name/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN target_name SET NOT NULL;

