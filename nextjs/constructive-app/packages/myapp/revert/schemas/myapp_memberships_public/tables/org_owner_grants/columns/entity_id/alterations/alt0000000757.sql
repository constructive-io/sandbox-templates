-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/entity_id/alterations/alt0000000757


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


