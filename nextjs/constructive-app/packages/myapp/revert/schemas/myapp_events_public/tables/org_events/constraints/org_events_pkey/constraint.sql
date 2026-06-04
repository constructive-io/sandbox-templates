-- Revert: schemas/myapp_events_public/tables/org_events/constraints/org_events_pkey/constraint


ALTER TABLE myapp_events_public.org_events 
  DROP CONSTRAINT org_events_pkey;


