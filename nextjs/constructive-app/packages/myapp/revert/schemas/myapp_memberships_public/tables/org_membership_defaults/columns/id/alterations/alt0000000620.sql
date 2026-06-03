-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/id/alterations/alt0000000620


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ALTER COLUMN id DROP NOT NULL;


