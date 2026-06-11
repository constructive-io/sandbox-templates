-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/expires_at/alterations/alt0000000115
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/expires_at/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_codes.expires_at IS E'Expiration timestamp; NULL for no expiry';

