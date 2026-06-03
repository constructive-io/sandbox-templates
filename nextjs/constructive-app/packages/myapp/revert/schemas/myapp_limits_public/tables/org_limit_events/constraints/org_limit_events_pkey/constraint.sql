-- Revert: schemas/myapp_limits_public/tables/org_limit_events/constraints/org_limit_events_pkey/constraint


ALTER TABLE myapp_limits_public.org_limit_events 
  DROP CONSTRAINT org_limit_events_pkey;


