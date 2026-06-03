-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/indexes/org_limit_credits_default_limit_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/default_limit_id/column


CREATE INDEX org_limit_credits_default_limit_id_idx ON myapp_limits_public.org_limit_credits USING BTREE ( default_limit_id );

