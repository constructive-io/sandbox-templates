-- Deploy: schemas/myapp_auth_public/procedures/current_user/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


CREATE FUNCTION myapp_auth_public.current_user() RETURNS myapp_users_public.users AS $_PGFN_$
DECLARE
  v_user myapp_users_public.users;
BEGIN
  IF myapp_auth_public.current_user_id() IS NOT NULL THEN
    SELECT *
    FROM ONLY myapp_users_public.users
    WHERE
      id = myapp_auth_public.current_user_id() INTO v_user;
    RETURN v_user;
  ELSE
    RETURN NULL;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE;

