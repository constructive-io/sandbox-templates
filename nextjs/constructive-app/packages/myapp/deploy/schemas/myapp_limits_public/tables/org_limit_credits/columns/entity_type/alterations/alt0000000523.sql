-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/entity_type/alterations/alt0000000523
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/entity_type/column


COMMENT ON COLUMN myapp_limits_public.org_limit_credits.entity_type IS E'Membership prefix identifying the entity kind (org, team, app)';

