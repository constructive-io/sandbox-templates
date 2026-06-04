-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/permissions/column


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  DROP COLUMN permissions RESTRICT;


