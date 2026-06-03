-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/fixtures/fix0000001286
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


INSERT INTO myapp_auth_private.app_settings_rate_limit (
  ip_rate_limit_window,
  ip_max_attempts,
  ip_lockout_duration,
  user_rate_limit_window,
  user_max_attempts,
  user_lockout_duration,
  email_cooldown_period,
  ip_ua_max_attempts,
  login_max_attempts,
  login_lockout_duration
)
VALUES
  ('15 minutes'::interval, 250, '30 minutes'::interval, '15 minutes'::interval, 10, '15 minutes'::interval, '1 minute'::interval, 50, 5, '15 minutes'::interval);

