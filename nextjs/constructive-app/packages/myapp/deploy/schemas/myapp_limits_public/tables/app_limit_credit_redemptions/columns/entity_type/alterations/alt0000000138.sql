-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_type/alterations/alt0000000138
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/entity_type/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_redemptions.entity_type IS E'Membership prefix identifying the entity kind (org, team, app)';

