-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_owner_grants 
  DROP COLUMN created_at RESTRICT;


