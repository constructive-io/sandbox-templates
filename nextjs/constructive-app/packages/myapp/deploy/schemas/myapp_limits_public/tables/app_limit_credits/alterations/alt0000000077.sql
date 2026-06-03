-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/alterations/alt0000000077
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/table


COMMENT ON TABLE myapp_limits_public.app_limit_credits IS E'Append-only ledger of credit grants that automatically update limit ceilings';

