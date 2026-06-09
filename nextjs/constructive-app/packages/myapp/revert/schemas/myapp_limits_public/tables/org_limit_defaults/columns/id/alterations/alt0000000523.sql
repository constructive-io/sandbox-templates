-- Revert: schemas/myapp_limits_public/tables/org_limit_defaults/columns/id/alterations/alt0000000523


ALTER TABLE myapp_limits_public.org_limit_defaults 
  ALTER COLUMN id DROP NOT NULL;


