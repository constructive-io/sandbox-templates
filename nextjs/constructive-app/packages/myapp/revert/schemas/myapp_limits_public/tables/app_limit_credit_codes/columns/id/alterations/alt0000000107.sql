-- Revert: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/id/alterations/alt0000000107


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ALTER COLUMN id DROP NOT NULL;


