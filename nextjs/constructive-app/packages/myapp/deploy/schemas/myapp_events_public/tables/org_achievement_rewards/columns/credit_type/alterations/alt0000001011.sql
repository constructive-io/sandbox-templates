-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/columns/credit_type/alterations/alt0000001011
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/columns/credit_type/column


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ALTER COLUMN credit_type SET DEFAULT 'permanent';

