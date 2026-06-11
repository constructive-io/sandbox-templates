-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/alterations/alt0000000593
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/table


COMMENT ON TABLE myapp_limits_public.org_limit_caps IS E'Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default.';

