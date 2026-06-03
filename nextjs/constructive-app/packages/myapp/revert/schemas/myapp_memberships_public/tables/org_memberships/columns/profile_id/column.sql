-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/profile_id/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN profile_id RESTRICT;


