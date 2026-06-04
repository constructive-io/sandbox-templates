-- Deploy: schemas/myapp_auth_public/procedures/current_user_id/grants/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/procedures/current_user_id/procedure


GRANT EXECUTE ON FUNCTION myapp_auth_public.current_user_id TO authenticated;

