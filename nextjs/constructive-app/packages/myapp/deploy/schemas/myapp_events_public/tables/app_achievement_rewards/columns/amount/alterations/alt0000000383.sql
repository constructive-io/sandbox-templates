-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/amount/alterations/alt0000000383
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/amount/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN amount SET NOT NULL;

