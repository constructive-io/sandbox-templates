-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/constraints/app_level_requirements_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table


ALTER TABLE myapp_events_public.app_level_requirements 
  ADD CONSTRAINT app_level_requirements_pkey PRIMARY KEY (id);

