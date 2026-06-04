-- Revert: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/permissions/column


ALTER TABLE myapp_memberships_private.app_memberships_sprt 
  DROP COLUMN permissions RESTRICT;


