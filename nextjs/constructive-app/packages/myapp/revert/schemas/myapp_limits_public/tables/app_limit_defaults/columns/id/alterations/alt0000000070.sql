-- Revert: schemas/myapp_limits_public/tables/app_limit_defaults/columns/id/alterations/alt0000000070


ALTER TABLE myapp_limits_public.app_limit_defaults 
  ALTER COLUMN id DROP NOT NULL;


