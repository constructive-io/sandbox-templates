-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/amount/alterations/alt0000000975
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/amount/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN amount SET NOT NULL;

