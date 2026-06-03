-- Revert: schemas/myapp_events_public/tables/app_levels/constraints/app_levels_pkey/constraint


ALTER TABLE myapp_events_public.app_levels 
  DROP CONSTRAINT app_levels_pkey;


