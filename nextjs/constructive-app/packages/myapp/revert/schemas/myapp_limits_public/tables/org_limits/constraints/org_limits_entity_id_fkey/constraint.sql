-- Revert: schemas/myapp_limits_public/tables/org_limits/constraints/org_limits_entity_id_fkey/constraint


ALTER TABLE myapp_limits_public.org_limits 
  DROP CONSTRAINT org_limits_entity_id_fkey;


