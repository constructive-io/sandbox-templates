-- Revert: schemas/myapp_auth_private/tables/session_secrets/triggers/timestamps_tg


DROP TRIGGER timestamps_tg ON myapp_auth_private.session_secrets;


