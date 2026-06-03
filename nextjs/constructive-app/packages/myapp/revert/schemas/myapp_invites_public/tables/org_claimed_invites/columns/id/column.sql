-- Revert: schemas/myapp_invites_public/tables/org_claimed_invites/columns/id/column


ALTER TABLE myapp_invites_public.org_claimed_invites 
  DROP COLUMN id RESTRICT;


