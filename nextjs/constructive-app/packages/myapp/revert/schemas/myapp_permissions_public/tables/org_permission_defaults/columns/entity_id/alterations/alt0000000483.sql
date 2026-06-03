-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/alterations/alt0000000483


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  ALTER COLUMN entity_id DROP NOT NULL;


