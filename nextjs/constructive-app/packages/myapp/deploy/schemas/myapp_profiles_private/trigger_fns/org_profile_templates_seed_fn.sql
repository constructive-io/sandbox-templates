-- Deploy: schemas/myapp_profiles_private/trigger_fns/org_profile_templates_seed_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_private/schema


CREATE FUNCTION myapp_profiles_private.org_profile_templates_seed_fn() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  INSERT INTO myapp_profiles_public.org_profiles (
    name,
    slug,
    description,
    permissions,
    is_default,
    entity_id
  )
  SELECT
    t.name,
    t.slug,
    t.description,
    t.permissions,
    t.is_default,
    NEW.id
  FROM myapp_profiles_public.org_profile_templates AS t;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

