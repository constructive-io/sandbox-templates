-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/id/alterations/alt0000000050


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN id DROP NOT NULL;


