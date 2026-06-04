-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/entity_id/alterations/alt0000000637


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ALTER COLUMN entity_id DROP NOT NULL;


