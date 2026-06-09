-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/entity_id/alterations/alt0000001579


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN entity_id DROP NOT NULL;


