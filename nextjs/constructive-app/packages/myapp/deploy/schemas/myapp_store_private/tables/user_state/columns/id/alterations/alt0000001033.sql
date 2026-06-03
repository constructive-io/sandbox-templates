-- Deploy: schemas/myapp_store_private/tables/user_state/columns/id/alterations/alt0000001033
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/columns/id/column


COMMENT ON COLUMN myapp_store_private.user_state.id IS 'Unique identifier for this secret entry';

