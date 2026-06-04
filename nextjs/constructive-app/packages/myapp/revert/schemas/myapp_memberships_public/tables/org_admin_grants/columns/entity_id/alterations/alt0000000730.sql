-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/entity_id/alterations/alt0000000730


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


