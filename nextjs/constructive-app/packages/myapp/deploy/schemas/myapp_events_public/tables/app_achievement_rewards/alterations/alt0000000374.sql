-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/alterations/alt0000000374
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table


COMMENT ON TABLE myapp_events_public.app_achievement_rewards IS E'Defines rewards granted when a level is achieved; supports limit_credits and meter_credits';

