-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/alterations/alt0000000130
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


COMMENT ON TABLE myapp_limits_public.app_limit_credit_redemptions IS E'Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits';

