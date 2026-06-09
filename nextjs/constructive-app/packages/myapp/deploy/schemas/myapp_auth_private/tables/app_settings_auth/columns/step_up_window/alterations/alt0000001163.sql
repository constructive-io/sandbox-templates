-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/step_up_window/alterations/alt0000001163
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/step_up_window/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.step_up_window IS E'How long a password or MFA re-verification remains valid for step-up authentication';

