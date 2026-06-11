-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/constraints/app_limit_credits_default_limit_id_fkey/constraint


ALTER TABLE myapp_limits_public.app_limit_credits 
  DROP CONSTRAINT app_limit_credits_default_limit_id_fkey;


