-- Deploy: schemas/myapp_events_public/tables/org_achievement_rewards/constraints/org_achievement_rewards_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table


ALTER TABLE myapp_events_public.org_achievement_rewards 
  ADD CONSTRAINT org_achievement_rewards_pkey PRIMARY KEY (id);

