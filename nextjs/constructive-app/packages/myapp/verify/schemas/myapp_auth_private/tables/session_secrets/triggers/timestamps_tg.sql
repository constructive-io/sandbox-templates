-- Verify: schemas/myapp_auth_private/tables/session_secrets/triggers/timestamps_tg


SELECT verify_trigger('myapp_auth_private.timestamps_tg');


