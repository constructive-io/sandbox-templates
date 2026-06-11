-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/constraints/app_limit_events_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/table


ALTER TABLE myapp_limits_public.app_limit_events 
  ADD CONSTRAINT app_limit_events_pkey PRIMARY KEY (created_at, id);

