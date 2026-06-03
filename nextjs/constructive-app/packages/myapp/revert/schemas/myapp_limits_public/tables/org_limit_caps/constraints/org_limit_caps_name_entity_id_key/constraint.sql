-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/constraints/org_limit_caps_name_entity_id_key/constraint


ALTER TABLE myapp_limits_public.org_limit_caps 
  DROP CONSTRAINT org_limit_caps_name_entity_id_key;


