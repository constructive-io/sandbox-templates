-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/updated_at/alterations/alt0000000407
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/updated_at/column


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ALTER COLUMN updated_at SET DEFAULT now();

