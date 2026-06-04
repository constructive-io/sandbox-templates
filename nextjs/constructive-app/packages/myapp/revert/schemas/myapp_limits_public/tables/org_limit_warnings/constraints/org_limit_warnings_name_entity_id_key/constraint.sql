-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/constraints/org_limit_warnings_name_entity_id_key/constraint


ALTER TABLE myapp_limits_public.org_limit_warnings 
  DROP CONSTRAINT org_limit_warnings_name_entity_id_key;


