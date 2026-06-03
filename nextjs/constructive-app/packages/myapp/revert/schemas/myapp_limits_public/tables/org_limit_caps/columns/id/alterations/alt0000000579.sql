-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/columns/id/alterations/alt0000000579


ALTER TABLE myapp_limits_public.org_limit_caps 
  ALTER COLUMN id DROP NOT NULL;


