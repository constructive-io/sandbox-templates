-- Verify: schemas/myapp_auth_private/tables/auth_ip_rate_limits/triggers/timestamps_tg


SELECT verify_trigger('myapp_auth_private.timestamps_tg');


