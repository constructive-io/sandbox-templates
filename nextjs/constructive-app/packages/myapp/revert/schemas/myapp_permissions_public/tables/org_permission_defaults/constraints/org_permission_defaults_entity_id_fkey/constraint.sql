-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/constraints/org_permission_defaults_entity_id_fkey/constraint


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  DROP CONSTRAINT org_permission_defaults_entity_id_fkey;


