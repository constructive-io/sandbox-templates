-- Deploy: migrate/index
-- made with <3 @ constructive.io

-- requires: migrate/policy


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

INSERT INTO metaschema_public.index (
  id,
  database_id,
  table_id,
  name,
  field_ids,
  include_field_ids,
  access_method,
  index_params,
  where_clause,
  is_unique
) VALUES
  ('019e917c-c7ad-70ff-b0e4-2f38854900df', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_search_tsv_gin_idx', '{019e917c-c7a0-782a-b09f-46975ae47cc7}', '{}', 'GIN', NULL, NULL, false),
  ('019e917c-c930-7cfc-8fed-947b5dd3dcef', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c908-7442-bfa8-8c34d5047e3d', 'app_limits_actor_id_idx', '{019e917c-c925-7f6f-9db1-e2ea37c58076}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-c9c0-793c-9fb3-c41909a2aaa5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c9a3-7d8d-936f-6fb3ea0227d1', 'app_limit_credits_default_limit_id_idx', '{019e917c-c9b5-7d34-ab25-d785f884cda8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-c9cb-7f8b-9888-a10bc1088dd2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c9a3-7d8d-936f-6fb3ea0227d1', 'app_limit_credits_actor_id_idx', '{019e917c-c9c3-7b14-b6ca-dbf62a6fe80d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-cd16-75d3-83af-af8132392f7b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ccda-7109-a427-df4193f76a81', 'app_memberships_sprts_actor_id_idx', '{019e917c-cd0a-7a54-99c9-c1366a037c9c}', '{019e917c-ccf9-7030-bb79-528059d3befa,019e917c-cce3-788c-8b1a-a1a1331cff38,019e917c-ccee-7495-8ad8-b9fcb7cfbbf6}', 'BTREE', NULL, NULL, true),
  ('019e917c-cdef-7a63-b2c0-af83e53877b8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cdc1-73dc-bc8e-424f745f2254', 'app_admin_grants_actor_id_idx', '{019e917c-cde3-71ee-8a42-3da21de4ae04}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-cdfe-7048-b50f-99e3179d0d9e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cdc1-73dc-bc8e-424f745f2254', 'app_admin_grants_grantor_id_idx', '{019e917c-cdf3-77b0-aaf6-e93f72e555d6}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ce43-70f1-8915-6c8f844767bd', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ce14-7f15-8910-8579c33c8257', 'app_owner_grants_actor_id_idx', '{019e917c-ce36-786a-8341-75d198e941a7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ce51-7160-ba04-b7bd8fe88316', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ce14-7f15-8910-8579c33c8257', 'app_owner_grants_grantor_id_idx', '{019e917c-ce46-7ccd-aa43-35b511d05104}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-cea4-7494-bac2-d691852da572', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ce68-70be-a99f-a6a70a564666', 'app_grants_actor_id_idx', '{019e917c-ce96-730b-85f7-23a8cde39269}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ceb5-7068-beee-fa86ca94da10', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ce68-70be-a99f-a6a70a564666', 'app_grants_grantor_id_idx', '{019e917c-cea9-71db-8ad6-91ab52dc546d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-cf74-7523-b940-9e97fb58af0e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf45-7a44-964c-0a3cdbd623c2', 'app_events_actor_id_idx', '{019e917c-cf65-7b2e-ab60-ada4e0bd9cae}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-cf8f-7045-a13d-23964c5c373e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf45-7a44-964c-0a3cdbd623c2', 'app_events_actor_id_name_idx', '{019e917c-cf65-7b2e-ab60-ada4e0bd9cae,019e917c-cf78-7bc7-84fb-e870a693cb4b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-cffb-7dbd-9e86-40fc7adbd90e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cfd1-7c2e-9100-b2c020aeb3ea', 'app_event_aggregates_actor_id_idx', '{019e917c-cfec-7d59-b57d-0b0690b10457}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d0f8-7038-b3ce-f82627efcb28', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d0ba-76bf-8adc-16e78c09638e', 'app_levels_owner_id_idx', '{019e917c-d0ed-76bd-aad0-0ae64e68e412}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d166-7121-ae18-561c5de4fec0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d114-7725-ad25-fc44639ff08f', 'app_level_requirements_level_idx', '{019e917c-d139-7b05-a7d7-85c985b6408f}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d16a-7261-b659-1fb3f289935a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d114-7725-ad25-fc44639ff08f', 'app_level_requirements_name_level_priority_idx', '{019e917c-d12e-7bd9-a6c0-500fbab2a7bd,019e917c-d139-7b05-a7d7-85c985b6408f,019e917c-d154-7d82-9d62-28a11beba27d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d1ac-7967-b44e-521ce00ecf9a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d183-7158-b589-d515ff0087c3', 'app_level_grants_actor_id_idx', '{019e917c-d19c-7bcf-8ac9-62e4869a6914}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d239-7377-95ce-6917dc1693cf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d1e3-7e5d-b4ee-50b378a7fa3e', 'app_achievement_rewards_level_name_idx', '{019e917c-d1fe-7092-8ce3-bdc34368c39d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d3a1-7e80-b3bd-d0acf0cb4fa8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d31b-73f0-b901-bd7fd7886eaa', 'app_profiles_is_default_idx', '{019e917c-d370-7cf6-91e0-5520f8223b28}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d3e8-74ea-9143-1f2426b57fb0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d3ab-7618-8e9d-325de97ff925', 'app_profile_permissions_permission_id_idx', '{019e917c-d3d8-7003-a564-a7b88e93840c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d3f2-740f-9c3e-79d3705bc6e4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d3ab-7618-8e9d-325de97ff925', 'app_profile_permissions_profile_id_idx', '{019e917c-d3c6-7a98-a911-726bfd273bf7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d457-7730-9607-a49b193f6108', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d410-7181-b414-c6b70876aeea', 'app_profile_grants_grantor_id_idx', '{019e917c-d449-734b-9a5c-8d4f712f956a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d46a-7b45-850f-9ab5926cada3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d410-7181-b414-c6b70876aeea', 'app_profile_grants_membership_id_idx', '{019e917c-d42c-77c4-8565-ed45dfb67d26}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d46f-7708-bf53-6405dc68b759', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d410-7181-b414-c6b70876aeea', 'app_profile_grants_profile_id_idx', '{019e917c-d43c-77c5-a56b-4fd1b7ec8a40}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d4d3-7e63-8670-dcebcbdd708c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d48c-7e18-8acc-60b424d6fb0f', 'app_profile_definition_grants_grantor_id_idx', '{019e917c-d4c7-7794-97ab-dc42b06c8ec0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d4e5-7a86-b627-ad2a140d690c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d48c-7e18-8acc-60b424d6fb0f', 'app_profile_definition_grants_profile_id_idx', '{019e917c-d4a8-7ae1-8c7c-b30624ceaf4d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d4ea-7216-8c8b-9e2f25054361', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d48c-7e18-8acc-60b424d6fb0f', 'app_profile_definition_grants_permission_id_idx', '{019e917c-d4b7-7f86-9f06-e5cfcb95c15d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d50e-7de9-a840-3ddaa95788c4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc6c-7041-afc8-7e92b06a6f7c', 'app_memberships_profile_id_idx', '{019e917c-d505-707a-9fee-300072142846}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d5be-7d27-ba77-f0a34350dcd4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d543-7e94-9463-cd65b284a50c', 'app_profile_templates_is_default_idx', '{019e917c-d58a-7934-af76-39c108e69529}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-d9c8-778a-8cec-746841930832', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d984-7c1d-aecd-0d2841277339', 'org_permission_defaults_entity_id_idx', '{019e917c-d9b6-74cc-98a7-6d5960a08a2e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-da0e-7e5b-89d8-20269937cd0e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d9cf-7f6c-b748-d5790c865dd3', 'org_limits_actor_id_idx', '{019e917c-d9f9-7f1d-904a-5c1505c800f0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-da71-7ada-8592-db5fda7f9c7c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d9cf-7f6c-b748-d5790c865dd3', 'org_limits_entity_id_idx', '{019e917c-da63-7667-8f05-771b8927619a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-db17-7424-b148-ca1a84143ece', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dae7-788d-8320-092d33c4948f', 'org_limit_credits_default_limit_id_idx', '{019e917c-db06-7492-abdc-cec30d3fe168}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-db2a-73dc-9d46-7c42422314bf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dae7-788d-8320-092d33c4948f', 'org_limit_credits_actor_id_idx', '{019e917c-db1b-7f49-8a42-3fae8ee923c9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-db3f-7049-ae6d-99e95b1742eb', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dae7-788d-8320-092d33c4948f', 'org_limit_credits_entity_id_idx', '{019e917c-db2f-72a4-bafc-45f104181116}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-dbd8-73de-ac7a-0b3cd1a8a9e4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-db9b-7f51-8354-163bd67ea789', 'org_limit_aggregates_entity_id_idx', '{019e917c-dbc5-7932-bf51-11260edb68aa}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e006-71ea-a4fe-708173ce8f50', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-df9c-7400-8cd0-8d462112e29a', 'org_memberships_sprts_actor_id_entity_id_idx', '{019e917c-dfdc-78c0-af4a-81b8dbd2630d,019e917c-dfe8-7cde-9620-64b0a55744d3}', '{019e917c-dfcb-7e77-8181-d0af6dff25c3}', 'BTREE', NULL, NULL, true),
  ('019e917c-e00b-7d1e-b027-b9c4ae954c96', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-df9c-7400-8cd0-8d462112e29a', 'org_memberships_sprts_actor_id_idx', '{019e917c-dfdc-78c0-af4a-81b8dbd2630d}', '{019e917c-dfcb-7e77-8181-d0af6dff25c3,019e917c-dfa9-7f95-882a-c206a36b7c43,019e917c-dfba-7ada-9b70-7827e0f40d24,019e917c-dff5-79b6-a747-633d7a0d8973}', 'BTREE', NULL, NULL, false),
  ('019e917c-e011-7066-9237-8e9b084f86ae', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-df9c-7400-8cd0-8d462112e29a', 'org_memberships_sprts_entity_id_idx', '{019e917c-dfe8-7cde-9620-64b0a55744d3}', '{019e917c-dfcb-7e77-8181-d0af6dff25c3,019e917c-dfa9-7f95-882a-c206a36b7c43,019e917c-dfba-7ada-9b70-7827e0f40d24,019e917c-dff5-79b6-a747-633d7a0d8973}', 'BTREE', NULL, NULL, false),
  ('019e917c-e1f9-7a0e-b99e-362803b3995b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-def8-70ad-aafa-13e9d90450c3', 'org_memberships_actor_id_idx', '{019e917c-e1cc-7616-ab73-499970d428c0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e1ff-7046-93c8-6d4b41336f38', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-def8-70ad-aafa-13e9d90450c3', 'org_memberships_entity_id_idx', '{019e917c-e1df-7c6b-b67d-44a923ac03d1}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e27c-707b-8f94-3eee7ea2d821', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e216-7e98-ab47-351109e8153a', 'org_members_actor_id_idx', '{019e917c-e24d-7613-892d-b01b47915eb3}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e281-7562-8655-826c501d9e3b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e216-7e98-ab47-351109e8153a', 'org_members_entity_id_idx', '{019e917c-e260-7e5e-94bd-edee51b70b85}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e303-7825-8642-43c46a016581', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e2b6-7c4d-b7e1-cd1d8ef03f35', 'org_admin_grants_actor_id_idx', '{019e917c-e2ed-7c03-8876-44070e8345b5}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e31c-7e59-a896-e716b41f7801', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e2b6-7c4d-b7e1-cd1d8ef03f35', 'org_admin_grants_entity_id_idx', '{019e917c-e308-7d43-838a-7347e43076e0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e331-7c40-a7a0-2232c63cf1ff', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e2b6-7c4d-b7e1-cd1d8ef03f35', 'org_admin_grants_grantor_id_idx', '{019e917c-e322-72fe-b6a2-2e6c354feb2b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e39f-7987-9a25-91cb3ad88cb3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e355-760a-bf73-8c0cd756876b', 'org_owner_grants_actor_id_idx', '{019e917c-e38a-791e-baf2-25e97165aef0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e3b8-7c0a-ba50-ed2ed667b469', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e355-760a-bf73-8c0cd756876b', 'org_owner_grants_entity_id_idx', '{019e917c-e3a4-7ed0-a472-72a699e19679}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e3cf-7b4e-b183-0107bb1046e4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e355-760a-bf73-8c0cd756876b', 'org_owner_grants_grantor_id_idx', '{019e917c-e3be-70ba-933c-7681b3b94594}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e465-7a8f-a650-a44de8a937f3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e3f4-7880-a960-30c5f744c50f', 'org_member_profiles_entity_id_idx', '{019e917c-e450-7fab-8418-7cee7b59c701}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e47f-737a-8ec2-b827ae40722a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e3f4-7880-a960-30c5f744c50f', 'org_member_profiles_actor_id_idx', '{019e917c-e46b-72a6-9f17-c377e88c11a0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e540-7995-9692-eb98d14aa278', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e4e0-76e6-8235-6d3566441276', 'org_grants_actor_id_idx', '{019e917c-e52a-77e2-aff1-a71d5d3b20cc}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e55b-78d4-841e-1ccc53031bd0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e4e0-76e6-8235-6d3566441276', 'org_grants_entity_id_idx', '{019e917c-e546-73f3-8dd1-2af5e096426e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e573-7ea8-889f-3d437185a028', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e4e0-76e6-8235-6d3566441276', 'org_grants_grantor_id_idx', '{019e917c-e561-7300-8c9b-537ca21321fe}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e6ab-79ec-9e20-8678131a26a6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e5f3-7942-9dbd-8bfcd241a428', 'org_profiles_entity_id_idx', '{019e917c-e699-7d66-a32c-5cf5d40862ab}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e6be-7879-8beb-20137f151c1d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e5f3-7942-9dbd-8bfcd241a428', 'org_profiles_is_default_idx', '{019e917c-e667-7e8e-8f74-14e12b961ea0}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e73c-7f5c-b302-8066141faf6d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e6cd-7f6f-b52c-711ef9ad4484', 'org_profile_permissions_permission_id_idx', '{019e917c-e725-7369-8ccc-caba5282b6b2}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e749-7a80-84fd-19ee2e1f415e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e6cd-7f6f-b52c-711ef9ad4484', 'org_profile_permissions_profile_id_idx', '{019e917c-e70e-7583-937b-ad0f259a802d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e7ce-742d-ab3f-40dd48b9d2d6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e76d-7caa-b924-3a3f414faf63', 'org_profile_grants_entity_id_idx', '{019e917c-e7b8-76a0-87c6-2c3567418d5f}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e7e6-7a70-b2c6-eac0f5f07c98', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e76d-7caa-b924-3a3f414faf63', 'org_profile_grants_grantor_id_idx', '{019e917c-e7d4-75da-941b-3561c6cd9e15}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e7ff-7dc2-a1f5-e6379efef2e0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e76d-7caa-b924-3a3f414faf63', 'org_profile_grants_membership_id_idx', '{019e917c-e791-7d26-beaa-85d5b68cbab3}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e805-7916-8618-a14789bdecb9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e76d-7caa-b924-3a3f414faf63', 'org_profile_grants_profile_id_idx', '{019e917c-e7a7-7901-a265-472b501e92c4}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e888-7e30-8108-7f50b39503d4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e829-7aef-b2ec-e8cf17607173', 'org_profile_definition_grants_grantor_id_idx', '{019e917c-e877-73cd-bc82-a5f6058173d2}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e8a3-747c-bc8d-ae904c9552ec', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e829-7aef-b2ec-e8cf17607173', 'org_profile_definition_grants_profile_id_idx', '{019e917c-e84d-73a1-bfa5-4aef38e09023}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e8a8-7f3f-aadf-f67f5b664768', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e829-7aef-b2ec-e8cf17607173', 'org_profile_definition_grants_permission_id_idx', '{019e917c-e862-732c-a2c4-0aa1d06d2fc5}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e8da-7bf1-afda-edcab9a933f9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-def8-70ad-aafa-13e9d90450c3', 'org_memberships_profile_id_idx', '{019e917c-e8cd-7d9b-a7ee-9deabaad07a4}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-e9c1-702c-b804-10020702caca', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e914-76a7-b721-6add1de9fe69', 'org_profile_templates_is_default_idx', '{019e917c-e979-71c1-b850-5181136ab2bd}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ea18-7d89-8c8c-17bdf8cba3b9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e9d6-72dc-b719-a6d31f8f097b', 'org_events_actor_id_idx', '{019e917c-e9ff-7840-9d69-8dd9905db0c2}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ea68-7e7a-a1fc-1cbd0d3b6ed7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e9d6-72dc-b719-a6d31f8f097b', 'org_events_actor_id_name_entity_id_idx', '{019e917c-e9ff-7840-9d69-8dd9905db0c2,019e917c-ea1e-73c1-9425-520e40ceab76,019e917c-ea42-714a-bd5e-09f39a5aba82}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ea6e-74bf-b5e5-a7a82d5cae3f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e9d6-72dc-b719-a6d31f8f097b', 'org_events_entity_id_idx', '{019e917c-ea42-714a-bd5e-09f39a5aba82}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-eb0d-7359-baae-607bc632b219', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eace-7e97-835e-13020e6d9194', 'org_event_aggregates_actor_id_idx', '{019e917c-eaf6-75f4-9567-2931f7444022}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-eb74-75ca-aa2b-830930846853', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eace-7e97-835e-13020e6d9194', 'org_event_aggregates_entity_id_idx', '{019e917c-eb44-75cf-911f-9f56e26ae234}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ec6c-7241-90b7-c623afa69f7c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eb9c-744c-a4a3-a66548d40bf0', 'org_event_types_entity_id_idx', '{019e917c-ec51-7ce6-9b9a-d51c94da2ce3}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ecfb-7ce0-94c9-d6b9e7dc9b7a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ec92-7ffa-9d03-863666d11e48', 'org_levels_owner_id_idx', '{019e917c-ece9-777e-afb0-9db0d3f5f066}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ed1b-7174-af10-55444e4c02c5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ec92-7ffa-9d03-863666d11e48', 'org_levels_entity_id_idx', '{019e917c-ed01-7cd2-8bb8-5b428fd482f1}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-edd6-72d4-badd-1b76b408410a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ed41-7a47-a284-5fe7054ef7f6', 'org_level_requirements_entity_id_idx', '{019e917c-edbd-7813-9d61-463048681a64}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-eddc-738b-8778-284f35932b58', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ed41-7a47-a284-5fe7054ef7f6', 'org_level_requirements_level_idx', '{019e917c-ed7b-71e9-b3a3-2ba3603af26d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ede2-7359-8599-de3ec2bab6dc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ed41-7a47-a284-5fe7054ef7f6', 'org_level_requirements_name_level_priority_idx', '{019e917c-ed69-7e98-8227-45e7fa1f9ce6,019e917c-ed7b-71e9-b3a3-2ba3603af26d,019e917c-edaa-79cb-a1ea-87fb15260cc9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ee4c-79fa-9fa4-815650e8be72', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ee0c-72c4-93b3-e5dfafc558b2', 'org_level_grants_actor_id_idx', '{019e917c-ee32-7b66-ba65-309ec587c273}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ee92-71a9-8ab2-6f553a0cf7a5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ee0c-72c4-93b3-e5dfafc558b2', 'org_level_grants_entity_id_idx', '{019e917c-ee77-7d00-9d0c-a5f50b4cab78}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ef59-7c3b-9b20-70bb32f8ca0c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eeb9-719f-b97d-99fba880b1af', 'org_achievement_rewards_entity_id_idx', '{019e917c-ef45-7dbc-ae8b-0b220bc151d1}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-ef60-7070-88cc-25db0b7ddf47', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eeb9-719f-b97d-99fba880b1af', 'org_achievement_rewards_level_name_idx', '{019e917c-eee4-7b6e-b449-ba07138a8811}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f5a4-71e2-adf1-e2619c543dc5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f4f2-7415-82e3-1b38f0540eb3', 'org_chart_edges_entity_id_idx', '{019e917c-f53f-750a-b361-b6460195dbc6}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f5aa-792c-a0b5-18380e79ab73', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f4f2-7415-82e3-1b38f0540eb3', 'org_chart_edges_parent_id_idx', '{019e917c-f570-74b9-930e-3a9179d592cd}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f5b1-783c-b832-71776f091008', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f4f2-7415-82e3-1b38f0540eb3', 'org_chart_edges_child_id_idx', '{019e917c-f558-71e0-b943-d708bd673bd8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f622-7a1e-b1e3-fdefce759ffc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f5c0-7754-9586-3d763f572262', 'org_hierarchy_sprts_entity_id_ancestor_id_idx', '{019e917c-f5d4-77f3-ab55-b8e00ae3b5a4,019e917c-f5e5-7328-b67d-fb3ef18be604}', '{019e917c-f607-761c-9f9d-a5a9dfef9da0}', 'BTREE', NULL, NULL, false),
  ('019e917c-f629-72f0-8934-0fec35904545', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f5c0-7754-9586-3d763f572262', 'org_hierarchy_sprts_entity_id_descendant_id_idx', '{019e917c-f5d4-77f3-ab55-b8e00ae3b5a4,019e917c-f5f5-7521-8c8d-1aafb901860e}', '{019e917c-f607-761c-9f9d-a5a9dfef9da0}', 'BTREE', NULL, NULL, false),
  ('019e917c-f62f-78b0-8cda-dbc906c30e8c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f5c0-7754-9586-3d763f572262', 'org_hierarchy_sprts_ancestor_id_idx', '{019e917c-f5e5-7328-b67d-fb3ef18be604}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f635-7c30-b083-151f100d005c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f5c0-7754-9586-3d763f572262', 'org_hierarchy_sprts_descendant_id_idx', '{019e917c-f5f5-7521-8c8d-1aafb901860e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f703-7928-bc0f-d3fc532b8fc5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f63c-7083-8d44-98f923225787', 'org_chart_edge_grants_entity_id_idx', '{019e917c-f666-76b5-b479-58aa0bc53c31}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f70a-711c-8503-7da25fe48487', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f63c-7083-8d44-98f923225787', 'org_chart_edge_grants_child_id_idx', '{019e917c-f67e-7890-a0c6-b2aaf10706cb}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f710-784f-b91f-bac2a1298760', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f63c-7083-8d44-98f923225787', 'org_chart_edge_grants_parent_id_idx', '{019e917c-f697-71dd-809d-9fb70bd8945a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-f717-711a-a1a2-0be68c3cad30', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f63c-7083-8d44-98f923225787', 'org_chart_edge_grants_grantor_id_idx', '{019e917c-f6a9-783e-8fc6-f573045fdc34}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-fa35-7a91-8d92-336ce932faa0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f903-7594-9d4b-120a88330a0a', 'sessions_user_id_idx', '{019e917c-f936-7fe9-8a29-d11db5d27fe9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-fb66-7fc3-a6dd-fab017671ddf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fa3c-76fb-8569-554b1a4b8d0e', 'session_credentials_session_id_idx', '{019e917c-fa67-71a5-a2b1-6c0edd2e68ff}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917c-fb6d-791a-bc5d-c7b4a2cbbdf2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fa3c-76fb-8569-554b1a4b8d0e', 'session_credentials_kind_idx', '{019e917c-fa78-7733-9f08-22864f092c22}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-00f9-7398-9dad-7f2476005858', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-00b0-7db3-b665-3dc3b0e00260', 'session_secrets_session_id_idx', '{019e917d-00de-7662-a2e3-b6ac1607187b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-03da-743c-80bf-67f9b729da72', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0304-72f7-9e10-d76721e2e685', 'auth_ip_rate_limits_ip_address_idx', '{019e917d-0332-7951-8be3-331c5f967298}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-03e1-7491-b1bb-2b80ecb80d46', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0304-72f7-9e10-d76721e2e685', 'auth_ip_rate_limits_locked_until_idx', '{019e917d-0399-7f26-875c-0f6056e803b7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-04b7-7bda-9202-93485824a13c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-03e8-7269-b6b3-3a43f76942f2', 'auth_rate_limits_subject_id_idx', '{019e917d-0418-71d7-bc67-52b4ee62ae21}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-04be-7a6d-aba1-6f31cb8a6f46', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-03e8-7269-b6b3-3a43f76942f2', 'auth_rate_limits_locked_until_idx', '{019e917d-0476-70cf-aa0f-8615112ac947}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-07bb-772c-8d48-758558980720', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0681-7994-aafe-ce0599f61fc6', 'app_namespace_events_namespace_id_created_at_idx', '{019e917d-06be-744c-9e0b-7ebd8df8e88a,019e917d-06af-7692-b467-8362e289f59a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1028-7fb6-8b2e-ae77b94b9efe', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0fcc-715e-9816-b34b39bf6205', 'emails_owner_id_idx', '{019e917d-100a-7244-8123-5d600fd6f213}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1366-7b2f-852e-858ab4cc7911', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-11e2-7499-a4f8-4437c1de9ae3', 'app_invites_expires_at_idx', '{019e917d-1304-732f-919f-5849574dfeb1}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-136e-7c17-9863-ec829ecd3a4c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-11e2-7499-a4f8-4437c1de9ae3', 'app_invites_invite_valid_idx', '{019e917d-1271-7379-8379-64135f56906c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1376-78da-911c-63a03b0a548f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-11e2-7499-a4f8-4437c1de9ae3', 'app_invites_sender_id_idx', '{019e917d-1239-7014-a091-2c69fbf64336}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1440-7c45-aa0d-2702e3e7654a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1387-7eaf-b9a0-a3258a40e55c', 'app_claimed_invites_sender_id_idx', '{019e917d-13d0-7cb6-b324-282c2e6f9775}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1448-7e23-be37-0d798e501349', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1387-7eaf-b9a0-a3258a40e55c', 'app_claimed_invites_receiver_id_idx', '{019e917d-13df-7e39-8942-d844ee521196}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-16d5-7625-89d9-b46895ce3c42', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_entity_id_idx', '{019e917d-16b7-768b-8628-495a83fb3a0d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-16e8-7f8b-b229-c2be708e2a4f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_expires_at_idx', '{019e917d-1660-748d-81b1-a2a5f9233b2b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-16f1-7150-887a-79702f004462', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_invite_valid_idx', '{019e917d-15a3-7ef8-abb2-2467c206982c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-16f9-7c12-8a0d-a00cfcbac90d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_sender_id_idx', '{019e917d-1557-7c6e-a361-175ff3ac90b3}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-171a-7007-b663-1c82f90d5af1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_receiver_id_idx', '{019e917d-1576-7273-965c-02b905bc5a1e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-17d1-72cb-8dd3-1e8ba4a92214', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1723-7668-9617-7d7873aac9cf', 'org_claimed_invites_sender_id_idx', '{019e917d-176c-723b-8ff0-16219bd5b4c8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-17d9-7c6d-ae9d-431d7f105fd7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1723-7668-9617-7d7873aac9cf', 'org_claimed_invites_receiver_id_idx', '{019e917d-177a-760b-ae0b-0f656151ad45}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1804-72c3-b13e-74b63af6e579', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1723-7668-9617-7d7873aac9cf', 'org_claimed_invites_entity_id_idx', '{019e917d-17ea-7258-9255-02fe96387909}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-19f0-7ab7-a920-dad3c087cfa1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1942-72c9-bb43-47a0fe675632', 'audit_log_auths_event_idx', '{019e917d-197d-7aee-b99d-2db5396d5dcb}', '{}', 'BTREE', NULL, NULL, false),
  ('019e917d-1a03-7e24-9a35-b79b5abccefa', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1942-72c9-bb43-47a0fe675632', 'audit_log_auths_actor_id_idx', '{019e917d-1994-77d6-91f9-cb33b9d0a2eb}', '{}', 'BTREE', NULL, NULL, false);


SET session_replication_role TO DEFAULT;


