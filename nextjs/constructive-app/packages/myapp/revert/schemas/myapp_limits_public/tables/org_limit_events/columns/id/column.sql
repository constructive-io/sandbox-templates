-- Revert: schemas/myapp_limits_public/tables/org_limit_events/columns/id/column


ALTER TABLE myapp_limits_public.org_limit_events 
  DROP COLUMN id RESTRICT;


