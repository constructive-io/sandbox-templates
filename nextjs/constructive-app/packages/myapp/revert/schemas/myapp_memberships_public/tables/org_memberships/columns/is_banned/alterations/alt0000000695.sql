-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_banned/alterations/alt0000000695


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_banned DROP DEFAULT;


