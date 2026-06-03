-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/default_limit_id/alterations/alt0000000080


ALTER TABLE myapp_limits_public.app_limit_credits 
  ALTER COLUMN default_limit_id DROP NOT NULL;


