-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/entity_id/alterations/alt0000000720


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN entity_id DROP NOT NULL;


