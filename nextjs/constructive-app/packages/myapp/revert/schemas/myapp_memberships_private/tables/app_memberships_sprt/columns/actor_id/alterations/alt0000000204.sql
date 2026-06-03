-- Revert: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/actor_id/alterations/alt0000000204


ALTER TABLE myapp_memberships_private.app_memberships_sprt 
  ALTER COLUMN actor_id DROP NOT NULL;


