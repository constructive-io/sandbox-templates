-- Deploy: schemas/myapp_auth_public/procedures/provision_new_user/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


CREATE FUNCTION myapp_auth_public.provision_new_user(
  IN email text,
  IN password text DEFAULT NULL,
  OUT user_id uuid
) AS $_PGFN_$
DECLARE
  v_user myapp_users_public.users;
  v_email myapp_user_identifiers_public.emails;
BEGIN
  INSERT INTO myapp_users_public.users
  VALUES
    (DEFAULT)
  RETURNING * INTO v_user;
  IF provision_new_user.email IS NOT NULL THEN
    INSERT INTO myapp_user_identifiers_public.emails (
      owner_id,
      email
    )
    VALUES
      (v_user.id, trim(provision_new_user.email))
    RETURNING * INTO v_email;
  END IF;
  IF provision_new_user.password IS NOT NULL THEN
    PERFORM myapp_store_private.user_secrets_set(v_user.id, 'password_hash', trim(provision_new_user.password), 'crypt');
  END IF;
  SELECT v_user.id INTO user_id;
  RETURN;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

