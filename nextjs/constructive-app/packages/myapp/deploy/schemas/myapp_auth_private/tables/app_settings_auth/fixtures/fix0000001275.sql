-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/fixtures/fix0000001275
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


INSERT INTO myapp_auth_private.app_settings_auth (
  require_csrf_for_auth,
  default_session_duration,
  remember_me_duration,
  default_credential_duration,
  default_fingerprint_mode,
  allow_anonymous_sessions,
  allow_multiple_sessions,
  min_password_length,
  enable_cookie_auth,
  step_up_window,
  mfa_challenge_expiry,
  allow_sign_up,
  allow_password_sign_up,
  allow_identity_sign_up,
  allow_magic_link_sign_up,
  allow_sms_sign_up,
  allow_password_sign_in,
  allow_identity_sign_in,
  allow_magic_link_sign_in,
  allow_email_otp_sign_in,
  allow_sms_sign_in,
  allow_webauthn_sign_up,
  allow_webauthn_sign_in,
  allow_webauthn_usernameless,
  allow_cross_origin_token,
  require_mfa,
  allow_totp_mfa,
  allow_email_mfa,
  allow_sms_mfa,
  allow_backup_codes,
  allow_api_keys,
  api_key_max_per_user,
  api_key_default_duration,
  api_key_max_duration,
  identity_providers_max,
  oauth_state_max_age,
  oauth_require_verified_email,
  oauth_error_redirect_path,
  cookie_secure,
  cookie_samesite,
  cookie_httponly,
  cookie_max_age,
  cookie_path,
  enforce_primary_auth_method,
  enable_captcha
)
VALUES
  ('f'::boolean, '2 weeks'::interval, '30 days'::interval, '1 hour'::interval, 'lax', 't'::boolean, 't'::boolean, 8, 'f'::boolean, '30 minutes'::interval, '5 minutes'::interval, 't'::boolean, 't'::boolean, 'f'::boolean, 'f'::boolean, 'f'::boolean, 't'::boolean, 'f'::boolean, 'f'::boolean, 'f'::boolean, 'f'::boolean, 'f'::boolean, 'f'::boolean, 'f'::boolean, 't'::boolean, 'f'::boolean, 't'::boolean, 't'::boolean, 'f'::boolean, 't'::boolean, 't'::boolean, 10, '90 days'::interval, '365 days'::interval, 10, '10 minutes'::interval, 't'::boolean, '/auth/error', 't'::boolean, 'lax', 't'::boolean, '2 weeks'::interval, '/', 't'::boolean, 'f'::boolean);

