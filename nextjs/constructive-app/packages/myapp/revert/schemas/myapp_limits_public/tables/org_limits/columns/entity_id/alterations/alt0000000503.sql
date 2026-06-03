-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/entity_id/alterations/alt0000000503


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN entity_id DROP NOT NULL;


