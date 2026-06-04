-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/entity_id/column


ALTER TABLE myapp_memberships_public.org_members 
  DROP COLUMN entity_id RESTRICT;


