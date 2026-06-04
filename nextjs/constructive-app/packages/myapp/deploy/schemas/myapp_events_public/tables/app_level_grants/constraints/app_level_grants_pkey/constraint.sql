-- Deploy: schemas/myapp_events_public/tables/app_level_grants/constraints/app_level_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


ALTER TABLE myapp_events_public.app_level_grants 
  ADD CONSTRAINT app_level_grants_pkey PRIMARY KEY (id);

