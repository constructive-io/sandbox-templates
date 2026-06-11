-- Verify: schemas/myapp_auth_private/tables/app_settings_rate_limit/triggers/timestamps_tg


SELECT verify_trigger('myapp_auth_private.timestamps_tg');


