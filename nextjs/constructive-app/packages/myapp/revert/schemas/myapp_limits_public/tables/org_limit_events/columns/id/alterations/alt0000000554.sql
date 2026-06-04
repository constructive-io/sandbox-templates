-- Revert: schemas/myapp_limits_public/tables/org_limit_events/columns/id/alterations/alt0000000554


ALTER TABLE myapp_limits_public.org_limit_events 
  ALTER COLUMN id DROP NOT NULL;


