-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/updated_at/alterations/alt0000000632


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN updated_at DROP DEFAULT;


