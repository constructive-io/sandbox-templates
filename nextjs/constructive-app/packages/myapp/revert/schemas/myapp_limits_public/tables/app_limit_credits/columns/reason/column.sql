-- Revert: schemas/myapp_limits_public/tables/app_limit_credits/columns/reason/column


ALTER TABLE myapp_limits_public.app_limit_credits 
  DROP COLUMN reason RESTRICT;


