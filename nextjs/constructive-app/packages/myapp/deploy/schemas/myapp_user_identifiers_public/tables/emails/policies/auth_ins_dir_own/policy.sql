-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/policies/auth_ins_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


CREATE POLICY auth_ins_dir_own ON myapp_user_identifiers_public.emails
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = jwt_public.current_user_id()
);

