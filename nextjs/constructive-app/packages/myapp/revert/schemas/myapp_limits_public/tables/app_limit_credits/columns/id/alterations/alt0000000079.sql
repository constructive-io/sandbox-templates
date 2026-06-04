-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/id/alterations/alt0000000079


ALTER TABLE myapp_limits_public.app_limit_credits 
  ALTER COLUMN id DROP DEFAULT;


