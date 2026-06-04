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
  ('019e917c-c772-7ad9-bec4-337ce1956129', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75e-769d-9faa-c68e3a60388f', 'users', NULL),
  ('019e917c-c7b1-7312-bcff-4d41a07d5ada', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75e-769d-9faa-c68e3a60388f', 'role_types', NULL),
  ('019e917c-c803-7904-8ee6-91b33d737e81', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'membership_types', 'Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member)'),
  ('019e917c-c86e-7965-813c-c19099a78a80', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'app_permissions', 'Defines available permissions as named bits within a bitmask, used by the RBAC system for access control'),
  ('019e917c-c8b8-7842-8c28-22a20822040b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'app_permission_defaults', 'Stores the default permission bitmask assigned to new members upon joining'),
  ('019e917c-c908-7442-bfa8-8c34d5047e3d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limits', 'Tracks per-actor usage counts against configurable maximum limits'),
  ('019e917c-c969-769e-8937-c8bff7210a96', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_defaults', 'Default maximum values for each named limit, applied when no per-actor override exists'),
  ('019e917c-c9a3-7d8d-936f-6fb3ea0227d1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_credits', 'Append-only ledger of credit grants that automatically update limit ceilings'),
  ('019e917c-c9fe-7cb1-80a4-c789527aab6e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_events', 'Append-only log of limit events for historical reporting and audit'),
  ('019e917c-ca84-78e3-b9c9-d440fb6adafc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_credit_codes', 'Redeemable credit codes managed by admins with the add_credits permission'),
  ('019e917c-cad5-7e34-b382-0cbc3adcec35', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_credit_code_items', 'Items within a credit code — each row grants credits for a specific limit definition'),
  ('019e917c-cb25-7064-b1ba-1750c039caa2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_credit_redemptions', 'Append-only ledger of code redemptions; AFTER INSERT trigger validates and cascades to limit_credits'),
  ('019e917c-cb67-7a78-9dcb-26cde558af13', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_caps_defaults', 'Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers.'),
  ('019e917c-cb93-7161-8150-6ec5790d38a0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_caps', 'Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default.'),
  ('019e917c-cbd1-7ec0-86c9-31bbc185a974', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'app_limit_warnings', 'Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it.'),
  ('019e917c-cc08-7482-8fe3-345de15234e5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8ec-7140-b0b3-c7d939ed67ba', 'app_limit_warning_state', 'Tracks which warnings have been sent to avoid duplicate notifications. One row per warning config per actor.'),
  ('019e917c-cc6c-7041-afc8-7e92b06a6f7c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'app_memberships', 'Tracks membership records linking actors to entities with permission bitmasks, ownership, and admin status'),
  ('019e917c-cca5-7dcf-90c8-1d174d4e5e7e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'app_membership_defaults', 'Default membership settings per entity, controlling initial approval and verification state for new members'),
  ('019e917c-ccda-7109-a427-df4193f76a81', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc47-7b68-8560-d56484bdcb7e', 'app_memberships_sprt', 'Security Predicate Resolution Table (SPRT). Denormalized lookup table used by RLS policies for fast permission checks without recursive queries'),
  ('019e917c-cdc1-73dc-bc8e-424f745f2254', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'app_admin_grants', 'Records of admin role grants and revocations between members'),
  ('019e917c-ce14-7f15-8910-8579c33c8257', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'app_owner_grants', 'Records of ownership transfers and grants between members'),
  ('019e917c-ce68-70be-a99f-a6a70a564666', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'app_grants', 'Records of individual permission grants and revocations for members via bitmask'),
  ('019e917c-cf45-7a44-964c-0a3cdbd623c2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_events', 'Partitioned append-only log of individual user actions; every single event ever recorded'),
  ('019e917c-cfd1-7c2e-9100-b2c020aeb3ea', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_event_aggregates', 'Aggregated user progress for level requirements, tallying the total count; updated via triggers and should not be modified manually'),
  ('019e917c-d037-7e8c-9e49-d163f3e010cf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_event_types', 'Catalog of known event types with per-type configuration for aggregation, retention, and level participation'),
  ('019e917c-d0ba-76bf-8adc-16e78c09638e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_levels', 'Defines available levels that users can achieve by completing requirements'),
  ('019e917c-d114-7725-ad25-fc44639ff08f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_level_requirements', 'Defines the specific requirements that must be met to achieve a level'),
  ('019e917c-d183-7158-b589-d515ff0087c3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_level_grants', 'Records when a user achieves a level; prevents duplicate reward grants'),
  ('019e917c-d1e3-7e5d-b4ee-50b378a7fa3e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'app_achievement_rewards', 'Defines rewards granted when a level is achieved; supports limit_credits and meter_credits'),
  ('019e917c-d31b-73f0-b901-bd7fd7886eaa', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'app_profiles', 'Named permission bundles (roles) that group multiple permissions into reusable profiles'),
  ('019e917c-d3ab-7618-8e9d-325de97ff925', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'app_profile_permissions', 'Join table linking profiles to individual permissions they include'),
  ('019e917c-d410-7181-b414-c6b70876aeea', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'app_profile_grants', 'Audit log of profile assignments and revocations for members'),
  ('019e917c-d48c-7e18-8acc-60b424d6fb0f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'app_profile_definition_grants', 'Audit log of permission additions and removals from profile definitions'),
  ('019e917c-d543-7e94-9463-cd65b284a50c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'app_profile_templates', 'Template profiles that are automatically seeded into new entities when created'),
  ('019e917c-d90f-71bb-84f8-6e668302c9af', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'org_permissions', 'Defines available permissions as named bits within a bitmask, used by the RBAC system for access control'),
  ('019e917c-d984-7c1d-aecd-0d2841277339', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'org_permission_defaults', 'Stores the default permission bitmask assigned to new members upon joining'),
  ('019e917c-d9cf-7f6c-b748-d5790c865dd3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limits', 'Tracks per-actor usage counts against configurable maximum limits'),
  ('019e917c-da8c-739c-b716-ba8f19541bc2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_defaults', 'Default maximum values for each named limit, applied when no per-actor override exists'),
  ('019e917c-dae7-788d-8320-092d33c4948f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_credits', 'Append-only ledger of credit grants that automatically update limit ceilings'),
  ('019e917c-db9b-7f51-8354-163bd67ea789', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_aggregates', 'Tracks aggregate entity-level usage counts (org-wide caps, no per-user breakdown)'),
  ('019e917c-dc74-7351-8a28-83bb3d74794f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_events', 'Append-only log of limit events for historical reporting and audit'),
  ('019e917c-dd6b-79bc-90f0-0fa632b7cad3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_caps_defaults', 'Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers.'),
  ('019e917c-ddad-7701-a6f6-556e710388bf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_caps', 'Per-entity cap overrides. Allows specific orgs/entities to have different cap values than the scope default.'),
  ('019e917c-de15-700b-acf1-e28d7db7d478', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'org_limit_warnings', 'Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it.'),
  ('019e917c-de80-7194-aa56-b36ca1ec3196', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8ec-7140-b0b3-c7d939ed67ba', 'org_limit_warning_state', 'Tracks which warnings have been sent to avoid duplicate notifications. One row per warning config per actor.'),
  ('019e917c-def8-70ad-aafa-13e9d90450c3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_memberships', 'Tracks membership records linking actors to entities with permission bitmasks, ownership, and admin status'),
  ('019e917c-df4a-74aa-b218-a5cd5b8222f9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_membership_defaults', 'Default membership settings per entity, controlling initial approval and verification state for new members'),
  ('019e917c-df9c-7400-8cd0-8d462112e29a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc47-7b68-8560-d56484bdcb7e', 'org_memberships_sprt', 'Security Predicate Resolution Table (SPRT). Denormalized lookup table used by RLS policies for fast permission checks without recursive queries'),
  ('019e917c-e043-7ff2-8cfd-fdb539d8b720', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_membership_settings', 'Per-entity settings for the memberships module'),
  ('019e917c-e216-7e98-ab47-351109e8153a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_members', 'Simplified view of active members in an entity, used for listing who belongs to an org or group'),
  ('019e917c-e2b6-7c4d-b7e1-cd1d8ef03f35', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_admin_grants', 'Records of admin role grants and revocations between members'),
  ('019e917c-e355-760a-bf73-8c0cd756876b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_owner_grants', 'Records of ownership transfers and grants between members'),
  ('019e917c-e3f4-7880-a960-30c5f744c50f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_member_profiles', 'Per-membership profile information visible to other entity members (display name, email, title, bio, avatar)'),
  ('019e917c-e4e0-76e6-8235-6d3566441276', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_grants', 'Records of individual permission grants and revocations for members via bitmask'),
  ('019e917c-e5f3-7942-9dbd-8bfcd241a428', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'org_profiles', 'Named permission bundles (roles) that group multiple permissions into reusable profiles'),
  ('019e917c-e6cd-7f6f-b52c-711ef9ad4484', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'org_profile_permissions', 'Join table linking profiles to individual permissions they include'),
  ('019e917c-e76d-7caa-b924-3a3f414faf63', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'org_profile_grants', 'Audit log of profile assignments and revocations for members'),
  ('019e917c-e829-7aef-b2ec-e8cf17607173', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'org_profile_definition_grants', 'Audit log of permission additions and removals from profile definitions'),
  ('019e917c-e914-76a7-b721-6add1de9fe69', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'org_profile_templates', 'Template profiles that are automatically seeded into new entities when created'),
  ('019e917c-e9d6-72dc-b719-a6d31f8f097b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_events', 'Partitioned append-only log of individual user actions; every single event ever recorded'),
  ('019e917c-eace-7e97-835e-13020e6d9194', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_event_aggregates', 'Aggregated user progress for level requirements, tallying the total count; updated via triggers and should not be modified manually'),
  ('019e917c-eb9c-744c-a4a3-a66548d40bf0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_event_types', 'Catalog of known event types with per-type configuration for aggregation, retention, and level participation'),
  ('019e917c-ec92-7ffa-9d03-863666d11e48', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_levels', 'Defines available levels that users can achieve by completing requirements'),
  ('019e917c-ed41-7a47-a284-5fe7054ef7f6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_level_requirements', 'Defines the specific requirements that must be met to achieve a level'),
  ('019e917c-ee0c-72c4-93b3-e5dfafc558b2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_level_grants', 'Records when a user achieves a level; prevents duplicate reward grants'),
  ('019e917c-eeb9-719f-b97d-99fba880b1af', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'org_achievement_rewards', 'Defines rewards granted when a level is achieved; supports limit_credits and meter_credits'),
  ('019e917c-f4f2-7415-82e3-1b38f0540eb3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_chart_edges', 'Organizational chart edges defining parent-child reporting relationships between members within an entity'),
  ('019e917c-f5c0-7754-9586-3d763f572262', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc47-7b68-8560-d56484bdcb7e', 'org_hierarchy_sprts', 'Transitive closure support table for fast ancestor/descendant lookups; rebuilt automatically by triggers'),
  ('019e917c-f63c-7083-8d44-98f923225787', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'org_chart_edge_grants', 'Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table'),
  ('019e917c-f818-79c1-aaf6-8dbe845fb23d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f7dd-78de-a2e0-656dfd691ce2', 'user_state', 'Internal per-user state store for auth counters, tokens, and ephemeral data'),
  ('019e917c-f903-7594-9d4b-120a88330a0a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'sessions', 'Tracks user authentication sessions with expiration, fingerprinting, and step-up verification state'),
  ('019e917c-fa3c-76fb-8569-554b1a4b8d0e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'session_credentials', 'Authentication credentials (bearer tokens, cookies, API keys, magic links) tied to sessions'),
  ('019e917c-fb74-715d-b16f-fadbd64d2e2c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'app_settings_auth', 'Singleton configuration table for authentication settings including session durations, lockout policy, and password requirements'),
  ('019e917d-00b0-7db3-b665-3dc3b0e00260', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'session_secrets', 'DB-private, session-scoped ephemeral key-value store for challenges/nonces (e.g. WebAuthn challenges, MFA tokens, magic-link nonces). Never exposed to clients; accessed only by SECURITY DEFINER procedures on the private schema.'),
  ('019e917d-0185-7692-b0ed-68710575a9b5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'app_settings_rate_limit', 'Singleton configuration table for rate limiting thresholds including IP-based and user-based windows, attempt limits, and lockout durations'),
  ('019e917d-0304-72f7-9e10-d76721e2e685', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'auth_ip_rate_limits', 'Tracks per-IP-address rate limiting state for anonymous auth functions with native inet type support and /64 IPv6 normalization'),
  ('019e917d-03e8-7269-b6b3-3a43f76942f2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'auth_rate_limits', 'Tracks per-user/subject rate limiting state for auth functions using UUID subject identifiers'),
  ('019e917d-0558-71ab-b908-9360125ec648', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-04c8-71ca-b083-c314ec5be4c9', 'app_namespaces', 'Logical namespace containers for grouping secrets, config, functions, and other resources'),
  ('019e917d-0681-7994-aafe-ce0599f61fc6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-04c8-71ca-b083-c314ec5be4c9', 'app_namespace_events', 'Namespace lifecycle events — audit log of creation, activation, deactivation, label changes'),
  ('019e917d-08e8-7b39-a720-f7005f011c33', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f7dd-78de-a2e0-656dfd691ce2', 'user_secrets', 'Per-user bcrypt credential store (password hashes, API key hashes)'),
  ('019e917d-0a53-794b-876d-af7f636589ff', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f7dd-78de-a2e0-656dfd691ce2', 'app_secrets', 'app-level PGP-encrypted key-value secrets store'),
  ('019e917d-0c02-73fd-b716-b940e3899dbb', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a0b-750d-b32c-510881b049fe', 'app_config', 'App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed'),
  ('019e917d-0d4c-7a89-9385-66308b2c589c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a0b-750d-b32c-510881b049fe', 'app_config_definitions', 'Registry of valid config keys — declares which config entries the platform recognizes'),
  ('019e917d-0fcc-715e-9816-b34b39bf6205', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f31-7c9d-aa51-b57afb1ca42c', 'emails', 'User email addresses with verification and primary-email management'),
  ('019e917d-11e2-7499-a4f8-4437c1de9ae3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'app_invites', 'Invitation records sent to prospective members via email, with token-based redemption and expiration'),
  ('019e917d-1387-7eaf-b9a0-a3258a40e55c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'app_claimed_invites', 'Records of successfully claimed invitations, linking senders to receivers'),
  ('019e917d-1505-7e4b-8c46-7c080144f34c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'org_invites', 'Invitation records sent to prospective members via email, with token-based redemption and expiration'),
  ('019e917d-1723-7668-9617-7d7873aac9cf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'org_claimed_invites', 'Records of successfully claimed invitations, linking senders to receivers'),
  ('019e917d-1942-72c9-bb43-47a0fe675632', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-18f2-7163-8640-3153d16bbeb2', 'audit_log_auth', 'Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.)');


SET session_replication_role TO DEFAULT;


