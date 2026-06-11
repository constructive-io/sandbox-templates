-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/is_admin/column


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  DROP COLUMN is_admin RESTRICT;


