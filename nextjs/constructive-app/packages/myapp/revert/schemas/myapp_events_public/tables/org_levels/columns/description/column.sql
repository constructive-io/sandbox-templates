-- Revert: schemas/myapp_events_public/tables/org_levels/columns/description/column


ALTER TABLE myapp_events_public.org_levels 
  DROP COLUMN description RESTRICT;


