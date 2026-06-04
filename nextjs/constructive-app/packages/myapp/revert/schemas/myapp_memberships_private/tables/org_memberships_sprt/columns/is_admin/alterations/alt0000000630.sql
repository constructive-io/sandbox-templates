-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/is_admin/alterations/alt0000000630


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ALTER COLUMN is_admin DROP DEFAULT;


