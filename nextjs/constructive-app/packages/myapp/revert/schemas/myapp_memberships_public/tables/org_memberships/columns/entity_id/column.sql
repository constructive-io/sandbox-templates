-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/entity_id/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN entity_id RESTRICT;


