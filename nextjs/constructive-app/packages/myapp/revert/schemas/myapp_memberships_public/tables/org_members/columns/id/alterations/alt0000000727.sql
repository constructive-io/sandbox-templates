-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/id/alterations/alt0000000727


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN id DROP NOT NULL;


