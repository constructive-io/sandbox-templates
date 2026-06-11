-- Revert: schemas/myapp_invites_public/tables/org_claimed_invites/columns/id/alterations/alt0000001583


ALTER TABLE myapp_invites_public.org_claimed_invites 
  ALTER COLUMN id DROP NOT NULL;


