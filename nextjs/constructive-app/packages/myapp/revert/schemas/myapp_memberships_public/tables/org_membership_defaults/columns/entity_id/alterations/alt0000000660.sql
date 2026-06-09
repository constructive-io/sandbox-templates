-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/entity_id/alterations/alt0000000660


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ALTER COLUMN entity_id DROP NOT NULL;


