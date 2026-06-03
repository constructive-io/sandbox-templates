-- Deploy: schemas/myapp_store_private/tables/user_state/policies/auth_del_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


CREATE POLICY auth_del_dir_own ON myapp_store_private.user_state
FOR DELETE
TO authenticated
USING (
  owner_id = jwt_public.current_user_id()
);

