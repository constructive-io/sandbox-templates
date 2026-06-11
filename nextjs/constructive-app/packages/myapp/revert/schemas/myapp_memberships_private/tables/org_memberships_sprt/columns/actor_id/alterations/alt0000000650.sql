-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/actor_id/alterations/alt0000000650


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ALTER COLUMN actor_id DROP NOT NULL;


