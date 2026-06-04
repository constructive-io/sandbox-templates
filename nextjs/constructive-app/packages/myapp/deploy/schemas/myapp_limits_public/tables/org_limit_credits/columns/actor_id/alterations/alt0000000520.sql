-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/actor_id/alterations/alt0000000520
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/actor_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_credits.actor_id IS E'User this credit is for; NULL for aggregate entity-level credits';

