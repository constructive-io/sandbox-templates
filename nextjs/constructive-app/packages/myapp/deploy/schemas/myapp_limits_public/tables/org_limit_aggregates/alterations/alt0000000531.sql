-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/alterations/alt0000000531
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


COMMENT ON TABLE myapp_limits_public.org_limit_aggregates IS E'Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown)';

