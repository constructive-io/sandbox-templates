-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_id/alterations/alt0000000136
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_redemptions.entity_id IS E'Entity receiving the credits (personal org user_id or org entity_id)';

