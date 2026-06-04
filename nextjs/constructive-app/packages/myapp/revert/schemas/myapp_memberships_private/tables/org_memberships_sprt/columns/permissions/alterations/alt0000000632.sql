-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/permissions/alterations/alt0000000632


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ALTER COLUMN permissions DROP NOT NULL;


