-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/updated_at/column


ALTER TABLE myapp_memberships_public.org_owner_grants 
  DROP COLUMN updated_at RESTRICT;


