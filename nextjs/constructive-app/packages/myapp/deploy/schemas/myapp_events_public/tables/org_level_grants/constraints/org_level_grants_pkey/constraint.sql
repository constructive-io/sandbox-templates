-- Deploy: schemas/myapp_events_public/tables/org_level_grants/constraints/org_level_grants_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table


ALTER TABLE myapp_events_public.org_level_grants 
  ADD CONSTRAINT org_level_grants_pkey PRIMARY KEY (id);

