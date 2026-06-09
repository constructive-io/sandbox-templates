-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/columns/target_name/alterations/alt0000000399
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/columns/target_name/column


COMMENT ON COLUMN myapp_events_public.app_achievement_rewards.target_name IS 'Target limit name or meter slug for the credit grant';

