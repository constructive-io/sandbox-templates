-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/id/alterations/alt0000001498


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN id DROP NOT NULL;


