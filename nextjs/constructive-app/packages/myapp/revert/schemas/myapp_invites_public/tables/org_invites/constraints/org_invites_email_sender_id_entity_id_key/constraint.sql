-- Revert: schemas/myapp_invites_public/tables/org_invites/constraints/org_invites_email_sender_id_entity_id_key/constraint


ALTER TABLE myapp_invites_public.org_invites 
  DROP CONSTRAINT org_invites_email_sender_id_entity_id_key;


