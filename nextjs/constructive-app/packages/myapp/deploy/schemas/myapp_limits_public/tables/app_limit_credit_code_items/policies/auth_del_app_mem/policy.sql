-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/policies/auth_del_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table


CREATE POLICY auth_del_app_mem ON myapp_limits_public.app_limit_credit_code_items
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000001000000000') = '0000000000000000000000000000000000000000000000000000001000000000')
);

