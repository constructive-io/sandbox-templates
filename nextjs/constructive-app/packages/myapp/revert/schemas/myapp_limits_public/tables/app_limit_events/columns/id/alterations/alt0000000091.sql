-- Revert: schemas/myapp_limits_public/tables/app_limit_events/columns/id/alterations/alt0000000091


ALTER TABLE myapp_limits_public.app_limit_events 
  ALTER COLUMN id DROP NOT NULL;


