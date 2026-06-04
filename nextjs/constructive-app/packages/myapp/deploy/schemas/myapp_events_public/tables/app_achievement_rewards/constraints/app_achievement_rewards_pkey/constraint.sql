-- Deploy: schemas/myapp_events_public/tables/app_achievement_rewards/constraints/app_achievement_rewards_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_achievement_rewards/table


ALTER TABLE myapp_events_public.app_achievement_rewards 
  ADD CONSTRAINT app_achievement_rewards_pkey PRIMARY KEY (id);

