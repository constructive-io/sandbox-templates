-- Deploy: schemas/myapp_limits_public/tables/org_limit_defaults/alterations/alt0000000507
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


COMMENT ON TABLE myapp_limits_public.org_limit_defaults IS E'Default maximum values for each named limit, applied when no per-actor override exists';

