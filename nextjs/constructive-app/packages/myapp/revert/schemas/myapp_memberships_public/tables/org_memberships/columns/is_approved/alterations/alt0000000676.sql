-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_approved/alterations/alt0000000676


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_approved DROP NOT NULL;


