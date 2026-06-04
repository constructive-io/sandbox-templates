-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/columns/entity_id/alterations/alt0000000583


ALTER TABLE myapp_limits_public.org_limit_caps 
  ALTER COLUMN entity_id DROP NOT NULL;


