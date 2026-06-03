-- Revert: schemas/myapp_limits_public/tables/org_limit_events/columns/num_before/column


ALTER TABLE myapp_limits_public.org_limit_events 
  DROP COLUMN num_before RESTRICT;


