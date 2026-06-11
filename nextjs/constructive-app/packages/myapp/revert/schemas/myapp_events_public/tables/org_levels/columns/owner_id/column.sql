-- Revert: schemas/myapp_events_public/tables/org_levels/columns/owner_id/column


ALTER TABLE myapp_events_public.org_levels 
  DROP COLUMN owner_id RESTRICT;


