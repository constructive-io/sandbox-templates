-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/id/alterations/alt0000000161


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN id DROP NOT NULL;


