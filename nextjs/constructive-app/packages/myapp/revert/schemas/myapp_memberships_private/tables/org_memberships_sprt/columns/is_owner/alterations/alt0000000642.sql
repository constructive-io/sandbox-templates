-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/is_owner/alterations/alt0000000642


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ALTER COLUMN is_owner DROP DEFAULT;


