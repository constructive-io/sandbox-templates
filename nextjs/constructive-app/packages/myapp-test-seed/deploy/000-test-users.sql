-- Deploy myapp-test-seed:000-test-users to pg
-- Seed: test users and org for local development
-- Mirrors provision/src/seed/index.ts in pure SQL so pgpm deploy can run it

-- ============================================================
-- 0. Create default partitions for RANGE-partitioned tables
-- pg_partman may not have run in local dev, so INSERTs into
-- partitioned tables (audit_log_auth, etc.) fail with
-- "no partition of relation found for row".
-- A DEFAULT partition catches any row that doesn't match
-- an existing range partition.
-- ============================================================

DO $$
BEGIN
  -- audit_log_auth
  IF NOT EXISTS (
    SELECT 1 FROM pg_inherits i JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE i.inhparent = 'myapp_logging_public.audit_log_auth'::regclass
    AND c.relname = 'audit_log_auth_default'
  ) THEN
    EXECUTE 'CREATE TABLE myapp_logging_public.audit_log_auth_default PARTITION OF myapp_logging_public.audit_log_auth DEFAULT';
  END IF;

  -- app_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_inherits i JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE i.inhparent = 'myapp_events_public.app_events'::regclass
    AND c.relname = 'app_events_default'
  ) THEN
    EXECUTE 'CREATE TABLE myapp_events_public.app_events_default PARTITION OF myapp_events_public.app_events DEFAULT';
  END IF;

  -- org_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_inherits i JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE i.inhparent = 'myapp_events_public.org_events'::regclass
    AND c.relname = 'org_events_default'
  ) THEN
    EXECUTE 'CREATE TABLE myapp_events_public.org_events_default PARTITION OF myapp_events_public.org_events DEFAULT';
  END IF;

  -- app_namespace_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_inherits i JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE i.inhparent = 'myapp_infra_public.app_namespace_events'::regclass
    AND c.relname = 'app_namespace_events_default'
  ) THEN
    EXECUTE 'CREATE TABLE myapp_infra_public.app_namespace_events_default PARTITION OF myapp_infra_public.app_namespace_events DEFAULT';
  END IF;

  -- app_limit_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_inherits i JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE i.inhparent = 'myapp_limits_public.app_limit_events'::regclass
    AND c.relname = 'app_limit_events_default'
  ) THEN
    EXECUTE 'CREATE TABLE myapp_limits_public.app_limit_events_default PARTITION OF myapp_limits_public.app_limit_events DEFAULT';
  END IF;

  -- org_limit_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_inherits i JOIN pg_class c ON i.inhrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE i.inhparent = 'myapp_limits_public.org_limit_events'::regclass
    AND c.relname = 'org_limit_events_default'
  ) THEN
    EXECUTE 'CREATE TABLE myapp_limits_public.org_limit_events_default PARTITION OF myapp_limits_public.org_limit_events DEFAULT';
  END IF;
END;
$$;

-- ============================================================
-- 1. Fix app_membership_defaults so non-owner users get approved
-- ============================================================
UPDATE "myapp_memberships_public".app_membership_defaults
SET is_approved = TRUE, is_verified = TRUE;

-- ============================================================
-- 1. Helper function to create a user with email, password, app membership
-- ============================================================

CREATE OR REPLACE FUNCTION pg_temp.seed_user(
  p_id uuid,
  p_username text,
  p_display_name text,
  p_email text,
  p_is_owner boolean DEFAULT FALSE,
  p_is_admin boolean DEFAULT FALSE
) RETURNS void AS $$
BEGIN
  INSERT INTO "myapp_users_public".users (id, username, display_name)
  VALUES (p_id, p_username, p_display_name)
  ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, username = EXCLUDED.username;

  INSERT INTO "myapp_user_identifiers_public".emails (owner_id, email)
  VALUES (p_id, p_email)
  ON CONFLICT DO NOTHING;

  PERFORM "myapp_store_private".user_secrets_set(p_id, 'password_hash', 'Password123!', 'crypt');

  INSERT INTO "myapp_memberships_public".app_memberships (
    actor_id, is_owner, is_admin, is_approved, is_verified, is_active,
    is_banned, is_disabled, permissions
  ) VALUES (
    p_id, p_is_owner, p_is_admin, TRUE, TRUE, TRUE,
    FALSE, FALSE, '0000000000000000000000000000000000000000000000000000000000000001'::bit(64)
  ) ON CONFLICT (actor_id) DO UPDATE SET
    is_owner = EXCLUDED.is_owner, is_admin = EXCLUDED.is_admin,
    is_approved = EXCLUDED.is_approved, is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active, is_banned = EXCLUDED.is_banned,
    is_disabled = EXCLUDED.is_disabled, permissions = EXCLUDED.permissions;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. Admin user (platform super-admin)
-- ============================================================

SELECT pg_temp.seed_user('00000000-0000-0000-0000-00000000ad01'::uuid, 'myapp.admin', 'MyApp Admin', 'admin@myapp.local', TRUE, TRUE);

-- ============================================================
-- 3. Test user: Alice Chen (founder of Acme Corp)
-- ============================================================

SELECT pg_temp.seed_user('00000000-0000-0000-0000-000000000001'::uuid, 'alice.chen', 'Alice Chen', 'alice@example.com', FALSE, FALSE);

-- ============================================================
-- 4. Test user: Bob Martinez (member of Acme Corp)
-- ============================================================

SELECT pg_temp.seed_user('00000000-0000-0000-0000-000000000002'::uuid, 'bob.martinez', 'Bob Martinez', 'bob@example.com', FALSE, FALSE);

-- ============================================================
-- 5. Create org: Acme Corp (type=2)
-- ============================================================

INSERT INTO "myapp_users_public".users (id, username, display_name, type)
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, 'acme_corp', 'Acme Corp', 2)
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Org email (required by sign_in if org needs to authenticate)
INSERT INTO "myapp_user_identifiers_public".emails (owner_id, email)
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, 'acme_corp@org.seed.local')
ON CONFLICT DO NOTHING;

-- Org password
SELECT "myapp_store_private".user_secrets_set('a0000000-0000-0000-0000-000000000001'::uuid, 'password_hash', encode(gen_random_bytes(24), 'hex'), 'crypt');

-- Org app membership
INSERT INTO "myapp_memberships_public".app_memberships (
  actor_id, is_owner, is_admin, is_approved, is_verified, is_active,
  is_banned, is_disabled, permissions
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid, TRUE, TRUE, TRUE, TRUE, TRUE,
  FALSE, FALSE, '0000000000000000000000000000000000000000000000000000000000000001'::bit(64)
) ON CONFLICT (actor_id) DO UPDATE SET
  is_owner = EXCLUDED.is_owner, is_admin = EXCLUDED.is_admin,
  is_approved = EXCLUDED.is_approved, is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active, is_banned = EXCLUDED.is_banned,
  is_disabled = EXCLUDED.is_disabled, permissions = EXCLUDED.permissions;

-- ============================================================
-- 6. Org memberships
-- ============================================================

-- Alice → owner of Acme Corp
INSERT INTO "myapp_memberships_public".org_memberships (actor_id, entity_id, is_owner, is_admin, is_approved, is_active, is_banned, is_disabled, is_external, is_read_only)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (actor_id, entity_id) DO UPDATE SET
  is_owner = EXCLUDED.is_owner, is_admin = EXCLUDED.is_admin,
  is_approved = EXCLUDED.is_approved, is_active = EXCLUDED.is_active;

-- Bob → member of Acme Corp
INSERT INTO "myapp_memberships_public".org_memberships (actor_id, entity_id, is_owner, is_admin, is_approved, is_active, is_banned, is_disabled, is_external, is_read_only)
VALUES ('00000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (actor_id, entity_id) DO UPDATE SET
  is_owner = EXCLUDED.is_owner, is_admin = EXCLUDED.is_admin,
  is_approved = EXCLUDED.is_approved, is_active = EXCLUDED.is_active;

-- Admin → owner of Acme Corp
INSERT INTO "myapp_memberships_public".org_memberships (actor_id, entity_id, is_owner, is_admin, is_approved, is_active, is_banned, is_disabled, is_external, is_read_only)
VALUES ('00000000-0000-0000-0000-00000000ad01'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (actor_id, entity_id) DO UPDATE SET
  is_owner = EXCLUDED.is_owner, is_admin = EXCLUDED.is_admin,
  is_approved = EXCLUDED.is_approved, is_active = EXCLUDED.is_active;
