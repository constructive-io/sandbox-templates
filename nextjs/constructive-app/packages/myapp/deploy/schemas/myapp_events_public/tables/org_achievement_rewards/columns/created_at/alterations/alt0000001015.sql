-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/created_at/alterations/alt0000001015
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/created_at/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN created_at SET DEFAULT now();

