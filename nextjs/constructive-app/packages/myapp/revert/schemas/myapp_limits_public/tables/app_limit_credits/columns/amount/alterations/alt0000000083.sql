-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/amount/alterations/alt0000000083


ALTER TABLE myapp_limits_public.app_limit_credits 
  ALTER COLUMN amount DROP NOT NULL;


