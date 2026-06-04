-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/id/alterations/alt0000000376
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/id/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN id SET DEFAULT uuidv7();

