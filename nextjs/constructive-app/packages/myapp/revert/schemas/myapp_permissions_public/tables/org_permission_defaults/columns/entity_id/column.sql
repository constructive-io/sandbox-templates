-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/column


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  DROP COLUMN entity_id RESTRICT;


