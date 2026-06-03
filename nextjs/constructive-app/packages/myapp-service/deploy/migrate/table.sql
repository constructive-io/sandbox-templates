-- Deploy: migrate/table
-- made with <3 @ constructive.io

-- requires: migrate/function


SET session_replication_role TO replica;
-- using replica in case we are deploying triggers to metaschema_public

-- unaccent, postgis affected and require grants
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

DO $LQLMIGRATION$
  DECLARE
  BEGIN

    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

  END;
$LQLMIGRATION$;

INSERT INTO metaschema_public.table (
  id,
  database_id,
  schema_id,
  name,
  description
) VALUES
  ('019e8c61-4a23-7673-9b91-1910c9553eea', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0e-7988-9f2d-cad4db71ff77', 'users', NULL),
  ('019e8c61-4a65-78b2-90d8-4740b1f7b87d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0e-7988-9f2d-cad4db71ff77', 'role_types', NULL),
  ('019e8c61-4aba-7c8f-bae5-da3c8761cf13', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'membership_types', 'Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member)'),
  ('019e8c61-4b2f-7ad3-a010-1dcc0f3134fb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'app_permissions', 'Defines available permissions as named bits within a bitmask, used by the RBAC system for access control'),
  ('019e8c61-4b86-7991-a627-50f2aaf13185', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'app_permission_defaults', 'Stores the default permission bitmask assigned to new members upon joining'),
  ('019e8c61-4bd8-7d41-9d0a-f604463e89b0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limits', 'Tracks per-actor usage counts against configurable maximum limits'),
  ('019e8c61-4c3a-791b-a4c7-3724b8d48bab', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_defaults', 'Default maximum values for each named limit, applied when no per-actor override exists'),
  ('019e8c61-4c7a-7eea-bd8e-899fe51ee383', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_credits', 'Append-only ledger of credit grants that automatically update limit ceilings'),
  ('019e8c61-4cd7-7c06-aacd-a6985e6cae3f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_events', 'Append-only log of limit events for historical reporting and audit'),
  ('019e8c61-4d6a-7811-b6a4-ce3ffd4a4d90', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_credit_codes', 'Redeemable credit codes managed by admins with the add_credits permission'),
  ('019e8c61-4daf-76cc-9be1-46c0be7e746e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_credit_code_items', 'Items within a credit code — each row grants credits for a specific limit definition'),
  ('019e8c61-4dfd-74b3-8fe3-1635a6e96a48', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_credit_redemptions', 'Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits'),
  ('019e8c61-4e46-7557-9fe4-5dbfdca44f4f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_caps_defaults', 'Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers.'),
  ('019e8c61-4e72-7154-b244-1c6f81472aec', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_caps', 'Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default.'),
  ('019e8c61-4eb3-7482-8798-8375e51a49bc', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'app_limit_warnings', 'Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it.'),
  ('019e8c61-4eef-77a0-a8ef-d9805bab42f1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bbc-797f-9e0d-ae185ea9a75e', 'app_limit_warning_state', 'Tracks which warnings have been sent to avoid duplicate notifications. One row per warning config per actor.'),
  ('019e8c61-4fc4-712d-aa74-ec2f43200cab', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'app_memberships', 'Tracks membership records linking actors to entities with permission bitmasks, ownership, and admin status'),
  ('019e8c61-5003-7dd6-bc23-3d550e167966', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'app_membership_defaults', 'Default membership settings per entity, controlling initial approval and verification state for new members'),
  ('019e8c61-503d-7e0a-a121-47aa9cf3f5f5', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4f34-73ee-a5e2-d2e07ad61720', 'app_memberships_sprt', 'Security Predicate Resolution Table (SPRT). Denormalized lookup table used by RLS policies for fast permission checks without recursive queries'),
  ('019e8c61-511e-77e2-bdb5-2e3c9096e2cd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'app_admin_grants', 'Records of admin role grants and revocations between members'),
  ('019e8c61-517a-722c-a1b5-1c6d4207bd79', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'app_owner_grants', 'Records of ownership transfers and grants between members'),
  ('019e8c61-51cf-7e26-b72f-778ec6e91887', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'app_grants', 'Records of individual permission grants and revocations for members via bitmask'),
  ('019e8c61-52b4-7b36-8d3b-53f925594eec', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_events', 'Partitioned append-only log of individual user actions; every single event ever recorded'),
  ('019e8c61-5355-7984-b207-6afa488ec116', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_event_aggregates', 'Aggregated user progress for level requirements, tallying the total count; updated via triggers and should not be modified manually'),
  ('019e8c61-53bf-7e3f-98b4-b4f4f63097a1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_event_types', 'Catalog of known event types with per-type configuration for aggregation, retention, and level participation'),
  ('019e8c61-5467-730c-adec-c4346e6f4432', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_levels', 'Defines available levels that users can achieve by completing requirements'),
  ('019e8c61-54d3-7677-8d3b-2c196ed62bd4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_level_requirements', 'Defines the specific requirements that must be met to achieve a level'),
  ('019e8c61-5551-7fac-ac23-d57eecc4b075', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_level_grants', 'Records when a user achieves a level; prevents duplicate reward grants'),
  ('019e8c61-55ba-7f88-9123-5278b63aba33', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'app_achievement_rewards', 'Defines rewards granted when a level is achieved; supports limit_credits and meter_credits'),
  ('019e8c61-56ef-783c-8673-192363215116', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'app_profiles', 'Named permission bundles (roles) that group multiple permissions into reusable profiles'),
  ('019e8c61-578a-7b7a-bafa-3b0aaebd206e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'app_profile_permissions', 'Join table linking profiles to individual permissions they include'),
  ('019e8c61-57f7-7a2b-871f-3b4be12acdbe', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'app_profile_grants', 'Audit log of profile assignments and revocations for members'),
  ('019e8c61-5875-70c7-a16d-79332a3c8b3d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'app_profile_definition_grants', 'Audit log of permission additions and removals from profile definitions'),
  ('019e8c61-5939-739e-9277-e6670e481724', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'app_profile_templates', 'Template profiles that are automatically seeded into new entities when created'),
  ('019e8c61-5d29-7de0-981d-5a7f07ee34b9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'org_permissions', 'Defines available permissions as named bits within a bitmask, used by the RBAC system for access control'),
  ('019e8c61-5dae-7cd7-bd66-799cf0f6fb7a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'org_permission_defaults', 'Stores the default permission bitmask assigned to new members upon joining'),
  ('019e8c61-5e00-7e1a-8427-d7008b86d5ae', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limits', 'Tracks per-actor usage counts against configurable maximum limits'),
  ('019e8c61-5ec2-79dd-ae45-369bec5e7a4d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_defaults', 'Default maximum values for each named limit, applied when no per-actor override exists'),
  ('019e8c61-5f2d-7e56-be7b-c87789bd7a25', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_credits', 'Append-only ledger of credit grants that automatically update limit ceilings'),
  ('019e8c61-5ff8-7fe4-bf7a-8cc5c9613c30', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_aggregates', 'Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown)'),
  ('019e8c61-60ed-7487-85c1-fc02b4eb19eb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_events', 'Append-only log of limit events for historical reporting and audit'),
  ('019e8c61-61f7-778d-be47-7ede5dbdfcbf', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_caps_defaults', 'Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers.'),
  ('019e8c61-6246-79b6-a317-690744b8b932', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_caps', 'Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default.'),
  ('019e8c61-62bd-7e45-85f6-37a07c1fc9dc', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'org_limit_warnings', 'Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it.'),
  ('019e8c61-6334-7fef-8d30-a8cafaec05f7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bbc-797f-9e0d-ae185ea9a75e', 'org_limit_warning_state', 'Tracks which warnings have been sent to avoid duplicate notifications. One row per warning config per actor.'),
  ('019e8c61-63ae-7d74-bf87-6db6c15e3e34', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_memberships', 'Tracks membership records linking actors to entities with permission bitmasks, ownership, and admin status'),
  ('019e8c61-640b-76c5-bdd4-6ff824e1399a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_membership_defaults', 'Default membership settings per entity, controlling initial approval and verification state for new members'),
  ('019e8c61-6463-76fa-b23a-e6f88fe8be48', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4f34-73ee-a5e2-d2e07ad61720', 'org_memberships_sprt', 'Security Predicate Resolution Table (SPRT). Denormalized lookup table used by RLS policies for fast permission checks without recursive queries'),
  ('019e8c61-6511-7bcf-9f20-33bcdcd3aae7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_membership_settings', 'Per-entity settings for the memberships module'),
  ('019e8c61-6707-7bc3-bd66-1f33bb4c29ff', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_members', 'Simplified view of active members in an entity, used for listing who belongs to an org or group'),
  ('019e8c61-67ac-7c35-888b-509bf3c4ed47', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_admin_grants', 'Records of admin role grants and revocations between members'),
  ('019e8c61-685c-792b-8809-e7039d0ec228', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_owner_grants', 'Records of ownership transfers and grants between members'),
  ('019e8c61-690a-70a9-8174-fca6ea09deab', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_member_profiles', 'Per-membership profile information visible to other entity members (display name, email, title, bio, avatar)'),
  ('019e8c61-6a0c-7af3-a0e8-8f1210dee00e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_grants', 'Records of individual permission grants and revocations for members via bitmask'),
  ('019e8c61-6b2b-7d4e-bc96-61bac654e74d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'org_profiles', 'Named permission bundles (roles) that group multiple permissions into reusable profiles'),
  ('019e8c61-6c28-7345-b0e9-281835706d68', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'org_profile_permissions', 'Join table linking profiles to individual permissions they include'),
  ('019e8c61-6ce3-71b6-a7f0-67c83ff6f5b5', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'org_profile_grants', 'Audit log of profile assignments and revocations for members'),
  ('019e8c61-6daf-7ef0-9cfa-fc9ccb1d0d2a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'org_profile_definition_grants', 'Audit log of permission additions and removals from profile definitions'),
  ('019e8c61-6eb0-7cfc-b926-e3c23f2ff1a3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'org_profile_templates', 'Template profiles that are automatically seeded into new entities when created'),
  ('019e8c61-6f7e-7b17-80e6-ddace807cb67', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_events', 'Partitioned append-only log of individual user actions; every single event ever recorded'),
  ('019e8c61-7091-718e-ac95-1725d47ff3b8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_event_aggregates', 'Aggregated user progress for level requirements, tallying the total count; updated via triggers and should not be modified manually'),
  ('019e8c61-716c-73c2-b358-28000c37fdc9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_event_types', 'Catalog of known event types with per-type configuration for aggregation, retention, and level participation'),
  ('019e8c61-7274-7d04-b498-89d146b1467c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_levels', 'Defines available levels that users can achieve by completing requirements'),
  ('019e8c61-7348-70b8-89dc-676ca5c385c2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_level_requirements', 'Defines the specific requirements that must be met to achieve a level'),
  ('019e8c61-7433-7839-96cb-13e23adcfe1d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_level_grants', 'Records when a user achieves a level; prevents duplicate reward grants'),
  ('019e8c61-74f3-711a-b865-71e639802fbe', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'org_achievement_rewards', 'Defines rewards granted when a level is achieved; supports limit_credits and meter_credits'),
  ('019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_chart_edges', 'Organizational chart edges defining parent-child reporting relationships between members within an entity'),
  ('019e8c61-7c4c-7ca8-b291-cca8a2d6b489', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4f34-73ee-a5e2-d2e07ad61720', 'org_hierarchy_sprts', 'Transitive closure support table for fast ancestor/descendant lookups; rebuilt automatically by triggers'),
  ('019e8c61-7cce-7aa0-8687-c300d471037e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'org_chart_edge_grants', 'Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table'),
  ('019e8c61-7ec6-7a83-98aa-428b7ce62047', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7e88-7171-bc93-3dc8a46f2dbb', 'user_state', 'Internal per-user state store for auth counters, tokens, and ephemeral data'),
  ('019e8c61-7fbb-7954-aa15-04256bba1ce7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'sessions', 'Tracks user authentication sessions with expiration, fingerprinting, and step-up verification state'),
  ('019e8c61-80f9-7177-a2b7-a4f11931b9e7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'session_credentials', 'Authentication credentials (bearer tokens, cookies, API keys, magic links) tied to sessions'),
  ('019e8c61-8240-7e77-b23f-53ed7d296ab6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'app_settings_auth', 'Singleton configuration table for authentication settings including session durations, lockout policy, and password requirements'),
  ('019e8c61-87c9-7b47-9e9a-03420e45641f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'session_secrets', 'DB-private, session-scoped ephemeral key-value store for challenges/nonces (e.g. WebAuthn challenges, MFA tokens, magic-link nonces). Never exposed to clients; accessed only by SECURITY DEFINER procedures on the private schema.'),
  ('019e8c61-88ad-70b7-99ea-16e2c0e96651', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'app_settings_rate_limit', 'Singleton configuration table for rate limiting thresholds including IP-based and user-based windows, attempt limits, and lockout durations'),
  ('019e8c61-8a3e-7402-bd69-608d4353836e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'auth_ip_rate_limits', 'Tracks per-IP-address rate limiting state for anonymous auth functions with native inet type support and /64 IPv6 normalization'),
  ('019e8c61-8b2e-7907-9377-1e7220947ae7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'auth_rate_limits', 'Tracks per-user/subject rate limiting state for auth functions using UUID subject identifiers'),
  ('019e8c61-8cb0-74c5-9efd-666ced7f5792', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c19-7c16-9da8-8302fab9a2a2', 'app_namespaces', 'Logical namespace containers for grouping secrets, config, functions, and other resources'),
  ('019e8c61-8dd1-7ea4-b9c5-8758daeb1446', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c19-7c16-9da8-8302fab9a2a2', 'app_namespace_events', 'Namespace lifecycle events — audit log of creation, activation, deactivation, label changes'),
  ('019e8c61-905b-754a-9ac3-7235f1eca9fc', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7e88-7171-bc93-3dc8a46f2dbb', 'user_secrets', 'Per-user bcrypt credential store (password hashes, API key hashes)'),
  ('019e8c61-91df-7216-a942-eecfef8d79d7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7e88-7171-bc93-3dc8a46f2dbb', 'app_secrets', 'app-level PGP-encrypted key-value secrets store'),
  ('019e8c61-93c1-7e0a-a54f-444d8300cfa6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9189-70ce-95d5-a7fd7d779a93', 'app_config', 'App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed'),
  ('019e8c61-9531-7d66-8c4b-a8120d03a5a6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9189-70ce-95d5-a7fd7d779a93', 'app_config_definitions', 'Registry of valid config keys — declares which config entries the platform recognizes'),
  ('019e8c61-97f3-7e65-b577-738d989cde95', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9753-75b8-a09f-c571535167ab', 'emails', 'User email addresses with verification and primary-email management'),
  ('019e8c61-9a34-748a-acf4-fb0ded800aa4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'app_invites', 'Invitation records sent to prospective members via email, with token-based redemption and expiration'),
  ('019e8c61-9c07-7804-ad65-589cba79f737', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'app_claimed_invites', 'Records of successfully claimed invitations, linking senders to receivers'),
  ('019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'org_invites', 'Invitation records sent to prospective members via email, with token-based redemption and expiration'),
  ('019e8c61-9fcc-7296-8afa-7b85b7ea7212', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'org_claimed_invites', 'Records of successfully claimed invitations, linking senders to receivers'),
  ('019e8c61-a206-732d-a4ca-52ebc3829b4c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a1b3-7312-9fb5-48dd943188ae', 'audit_log_auth', 'Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.)');


SET session_replication_role TO DEFAULT;


