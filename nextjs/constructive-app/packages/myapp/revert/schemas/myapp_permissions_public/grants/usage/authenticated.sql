-- Revert: schemas/myapp_permissions_public/grants/usage/authenticated


REVOKE USAGE ON SCHEMA myapp_permissions_public FROM authenticated;


