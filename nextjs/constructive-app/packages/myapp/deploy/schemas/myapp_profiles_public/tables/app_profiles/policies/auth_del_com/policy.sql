-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/policies/auth_del_com/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table


CREATE POLICY auth_del_com ON myapp_profiles_public.app_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      (app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000000001000000') = '0000000000000000000000000000000000000000000000000000000001000000')) AND is_system IS FALSE
);

