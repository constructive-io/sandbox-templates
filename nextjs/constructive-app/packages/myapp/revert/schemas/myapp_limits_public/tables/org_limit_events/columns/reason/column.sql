-- Revert: schemas/myapp_limits_public/tables/org_limit_events/columns/reason/column


ALTER TABLE myapp_limits_public.org_limit_events 
  DROP COLUMN reason RESTRICT;


