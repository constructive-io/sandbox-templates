-- Revert: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/actor_id/column


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  DROP COLUMN actor_id RESTRICT;


