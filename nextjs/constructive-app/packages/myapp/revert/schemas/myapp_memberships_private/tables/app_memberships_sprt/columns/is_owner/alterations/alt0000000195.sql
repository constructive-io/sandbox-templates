-- Revert: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/is_owner/alterations/alt0000000195


ALTER TABLE myapp_memberships_private.app_memberships_sprt 
  ALTER COLUMN is_owner DROP NOT NULL;


