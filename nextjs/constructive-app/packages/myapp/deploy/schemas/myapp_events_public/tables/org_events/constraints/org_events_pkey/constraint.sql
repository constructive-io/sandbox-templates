-- Deploy: schemas/myapp_events_public/tables/org_events/constraints/org_events_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table


ALTER TABLE myapp_events_public.org_events 
  ADD CONSTRAINT org_events_pkey PRIMARY KEY (created_at, id);

