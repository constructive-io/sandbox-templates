-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/id/alterations/alt0000000605


ALTER TABLE myapp_limits_public.org_limit_warnings 
  ALTER COLUMN id DROP NOT NULL;


