-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/columns/reason/alterations/alt0000000582
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/columns/reason/column


COMMENT ON COLUMN myapp_limits_public.org_limit_events.reason IS E'Optional reason or source: achievement, invite, plan_change, purchase, etc.';

