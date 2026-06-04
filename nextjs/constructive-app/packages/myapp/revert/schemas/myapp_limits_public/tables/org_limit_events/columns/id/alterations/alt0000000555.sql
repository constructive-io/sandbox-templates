-- Revert: schemas/myapp_limits_public/tables/org_limit_events/columns/id/alterations/alt0000000555


ALTER TABLE myapp_limits_public.org_limit_events 
  ALTER COLUMN id DROP DEFAULT;


