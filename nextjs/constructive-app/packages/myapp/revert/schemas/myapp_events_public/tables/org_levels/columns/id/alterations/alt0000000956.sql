-- Revert: schemas/myapp_events_public/tables/org_levels/columns/id/alterations/alt0000000956


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN id DROP NOT NULL;


