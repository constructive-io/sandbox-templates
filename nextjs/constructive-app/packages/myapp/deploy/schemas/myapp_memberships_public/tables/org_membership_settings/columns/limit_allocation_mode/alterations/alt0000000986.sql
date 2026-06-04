-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/alterations/alt0000000986
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/column


COMMENT ON COLUMN myapp_memberships_public.org_membership_settings.limit_allocation_mode IS E'Allocation mode for sub-entity limits: pooled (shared parent cap, no per-entity budgets) or budgeted (explicit per-entity allocations, transfer enabled)';

