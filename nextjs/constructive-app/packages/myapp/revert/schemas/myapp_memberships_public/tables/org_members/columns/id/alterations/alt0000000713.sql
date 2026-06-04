-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/id/alterations/alt0000000713


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN id DROP DEFAULT;


