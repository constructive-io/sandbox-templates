-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/id/alterations/alt0000000487


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN id DROP NOT NULL;


