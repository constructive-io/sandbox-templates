-- Deploy: migrate/primary_key_constraint
-- made with <3 @ constructive.io

-- requires: migrate/foreign_key_constraint


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

INSERT INTO metaschema_public.primary_key_constraint (
  id,
  database_id,
  table_id,
  name,
  type,
  field_ids
) VALUES
  ('019e917c-c787-7415-96f8-c79233829d37', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_pkey', 'p', '{019e917c-c77d-7a0f-b7c7-95cdece1dd58}'),
  ('019e917c-c7bb-7991-b95a-d020ca7d690d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7b1-7312-bcff-4d41a07d5ada', 'role_types_pkey', 'p', '{019e917c-c7b7-7f78-ae8d-83bb4775b3aa}'),
  ('019e917c-c814-796c-9bf5-863a7596b118', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c803-7904-8ee6-91b33d737e81', 'membership_types_pkey', 'p', '{019e917c-c80e-7414-85fc-7c6274e40d7a}'),
  ('019e917c-c87f-79ed-88d5-6ecf0ee655b8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c86e-7965-813c-c19099a78a80', 'app_permissions_pkey', 'p', '{019e917c-c878-750a-9be4-e032cc6b700a}'),
  ('019e917c-c8c6-77b0-aa0b-ead9578e76eb', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8b8-7842-8c28-22a20822040b', 'app_permission_defaults_pkey', 'p', '{019e917c-c8c0-76c0-aba2-8667733700ba}'),
  ('019e917c-c91c-79e3-8870-c70b1b6d715d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c908-7442-bfa8-8c34d5047e3d', 'app_limits_pkey', 'p', '{019e917c-c913-74cd-8e02-72c345e05110}'),
  ('019e917c-c977-7673-9e47-63fbad03d4bd', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c969-769e-8937-c8bff7210a96', 'app_limit_defaults_pkey', 'p', '{019e917c-c971-729d-9bcb-bc63565b992e}'),
  ('019e917c-c9b2-77aa-be3e-fae38bb0e956', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c9a3-7d8d-936f-6fb3ea0227d1', 'app_limit_credits_pkey', 'p', '{019e917c-c9ab-7e5e-8189-640273789815}'),
  ('019e917c-ca45-79ad-86b1-214a277ab65a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c9fe-7cb1-80a4-c789527aab6e', 'app_limit_events_pkey', 'p', '{019e917c-ca12-7544-b948-febfa2dc210f,019e917c-ca09-7581-8cb8-d50b7c073f60}'),
  ('019e917c-ca9d-726a-94e1-93910139364c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ca84-78e3-b9c9-d440fb6adafc', 'app_limit_credit_codes_pkey', 'p', '{019e917c-ca8d-7bf8-806c-6bb670ec96d7}'),
  ('019e917c-cae6-7122-8c9a-8f65c4fb0e69', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cad5-7e34-b382-0cbc3adcec35', 'app_limit_credit_code_items_pkey', 'p', '{019e917c-cade-7c63-965e-fe236b1a03f5}'),
  ('019e917c-cb34-7e24-bd41-4ada3084b8b6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cb25-7064-b1ba-1750c039caa2', 'app_limit_credit_redemptions_pkey', 'p', '{019e917c-cb2d-7a72-a290-3f31baf98ac7}'),
  ('019e917c-cb78-7a33-aa54-5e6c3b250d83', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cb67-7a78-9dcb-26cde558af13', 'app_limit_caps_defaults_pkey', 'p', '{019e917c-cb71-7469-9604-240d459b72c9}'),
  ('019e917c-cba3-7b1d-a787-ce387175ca67', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cb93-7161-8150-6ec5790d38a0', 'app_limit_caps_pkey', 'p', '{019e917c-cb9c-70e1-991e-3fb5de6416f1}'),
  ('019e917c-cbe2-750e-a7a0-a66d0cada253', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cbd1-7ec0-86c9-31bbc185a974', 'app_limit_warnings_pkey', 'p', '{019e917c-cbda-7de1-98e7-da2245ffd94f}'),
  ('019e917c-cc18-7834-a61e-6a6b391a4cb0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc08-7482-8fe3-345de15234e5', 'app_limit_warning_states_pkey', 'p', '{019e917c-cc10-7ae3-9a9c-60ab0d284921}'),
  ('019e917c-cc82-72c7-8b06-b95b0f910605', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc6c-7041-afc8-7e92b06a6f7c', 'app_memberships_pkey', 'p', '{019e917c-cc78-74b3-80a2-d1a8503ee3ce}'),
  ('019e917c-ccb7-767f-a6e4-4ffad9f189b1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cca5-7dcf-90c8-1d174d4e5e7e', 'app_membership_defaults_pkey', 'p', '{019e917c-ccaf-775b-8a2c-01bf9b5a190e}'),
  ('019e917c-cdd3-7388-abd4-451813baa302', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cdc1-73dc-bc8e-424f745f2254', 'app_admin_grants_pkey', 'p', '{019e917c-cdcb-704f-8fc0-075b919c90d4}'),
  ('019e917c-ce27-799e-8b3c-fd229659c251', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ce14-7f15-8910-8579c33c8257', 'app_owner_grants_pkey', 'p', '{019e917c-ce1f-71c7-bf22-8674e915d6ae}'),
  ('019e917c-ce7a-718a-b422-94e80207dd79', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ce68-70be-a99f-a6a70a564666', 'app_grants_pkey', 'p', '{019e917c-ce71-7cef-aab1-b0b12942bf45}'),
  ('019e917c-cfc6-7565-b487-aa227d925c62', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf45-7a44-964c-0a3cdbd623c2', 'app_events_pkey', 'p', '{019e917c-cf62-77b6-99a4-840968254c4a,019e917c-cf55-725d-ab32-b496cac4f337}'),
  ('019e917c-cfe7-78bd-bc58-987f410f3cde', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cfd1-7c2e-9100-b2c020aeb3ea', 'app_event_aggregates_pkey', 'p', '{019e917c-cfdd-718d-954d-faf4f1a8a729}'),
  ('019e917c-d04c-72a7-9065-6d0c138ae200', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d037-7e8c-9e49-d163f3e010cf', 'app_event_types_pkey', 'p', '{019e917c-d042-7ba2-9462-d2ef157f5b33}'),
  ('019e917c-d0cf-71ca-b5b1-a76c6df9bee7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d0ba-76bf-8adc-16e78c09638e', 'app_levels_pkey', 'p', '{019e917c-d0c4-7ddd-92ca-f9dfe7e624d3}'),
  ('019e917c-d129-7994-a0e9-bace7b40f1e9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d114-7725-ad25-fc44639ff08f', 'app_level_requirements_pkey', 'p', '{019e917c-d11f-73c4-a3ce-2b3649479720}'),
  ('019e917c-d197-7dfd-952c-b38c9064c4c5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d183-7158-b589-d515ff0087c3', 'app_level_grants_pkey', 'p', '{019e917c-d18d-7f21-bc5d-185471b3f84c}'),
  ('019e917c-d1f9-7574-9a2c-75a2cdbffbfe', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d1e3-7e5d-b4ee-50b378a7fa3e', 'app_achievement_rewards_pkey', 'p', '{019e917c-d1ee-7fea-9f32-b68180464e1d}'),
  ('019e917c-d335-775a-89fb-7bb2767d6e34', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d31b-73f0-b901-bd7fd7886eaa', 'app_profiles_pkey', 'p', '{019e917c-d329-753d-a99c-108e019eb35e}'),
  ('019e917c-d3c1-7ac3-805f-f34c56bb1059', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d3ab-7618-8e9d-325de97ff925', 'app_profile_permissions_pkey', 'p', '{019e917c-d3b7-74e3-a406-4488687b9127}'),
  ('019e917c-d426-794d-9d71-cac45f98912a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d410-7181-b414-c6b70876aeea', 'app_profile_grants_pkey', 'p', '{019e917c-d41b-7c0a-a1af-c5fe4eb3615f}'),
  ('019e917c-d4a3-752e-9d75-8c461effd63e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d48c-7e18-8acc-60b424d6fb0f', 'app_profile_definition_grants_pkey', 'p', '{019e917c-d498-7c98-af45-791d31463c67}'),
  ('019e917c-d55a-7eae-98ab-5a8513ca93d6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d543-7e94-9463-cd65b284a50c', 'app_profile_templates_pkey', 'p', '{019e917c-d550-74d9-ae4a-a854b20f0b80}'),
  ('019e917c-d928-746f-8f7c-88ff1a624edc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d90f-71bb-84f8-6e668302c9af', 'org_permissions_pkey', 'p', '{019e917c-d91c-77c0-b357-15021094964d}'),
  ('019e917c-d99e-7584-ab58-0c081d879675', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d984-7c1d-aecd-0d2841277339', 'org_permission_defaults_pkey', 'p', '{019e917c-d992-7858-b270-0c468e3d708c}'),
  ('019e917c-d9e8-7e36-ad2b-38172b53f039', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d9cf-7f6c-b748-d5790c865dd3', 'org_limits_pkey', 'p', '{019e917c-d9dd-76a3-a586-bb370c26ee13}'),
  ('019e917c-daa6-70ad-861c-f6aafe6e357e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-da8c-739c-b716-ba8f19541bc2', 'org_limit_defaults_pkey', 'p', '{019e917c-da99-733b-8bd5-66f20ee8537a}'),
  ('019e917c-db00-7582-979c-f92b46f0b0bd', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dae7-788d-8320-092d33c4948f', 'org_limit_credits_pkey', 'p', '{019e917c-daf4-763a-a0f5-511f95d4a323}'),
  ('019e917c-dbb6-7015-a6f9-137aa2cce501', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-db9b-7f51-8354-163bd67ea789', 'org_limit_aggregates_pkey', 'p', '{019e917c-dba9-7982-b669-49c762fbf9ea}'),
  ('019e917c-dd15-795a-b6db-9caec7fb617a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dc74-7351-8a28-83bb3d74794f', 'org_limit_events_pkey', 'p', '{019e917c-dc94-7207-98f7-30b9fe92d324,019e917c-dc84-7c31-b56b-7efc618666f1}'),
  ('019e917c-dd85-7901-94d9-3040682313fd', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dd6b-79bc-90f0-0fa632b7cad3', 'org_limit_caps_defaults_pkey', 'p', '{019e917c-dd79-7564-85cd-c5788a14a5ef}'),
  ('019e917c-ddc6-7dae-916f-708de180d15c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ddad-7701-a6f6-556e710388bf', 'org_limit_caps_pkey', 'p', '{019e917c-ddba-72c6-82f0-b4a7147d4f02}'),
  ('019e917c-de30-7dd7-ad3c-5012335b28c2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-de15-700b-acf1-e28d7db7d478', 'org_limit_warnings_pkey', 'p', '{019e917c-de23-7448-a8c8-7536f4ab042d}'),
  ('019e917c-de9a-70e3-a9c2-282b0de135b8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-de80-7194-aa56-b36ca1ec3196', 'org_limit_warning_states_pkey', 'p', '{019e917c-de8d-73b0-aba4-7c10e7c98e84}'),
  ('019e917c-df12-76c0-b294-c797b850180a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-def8-70ad-aafa-13e9d90450c3', 'org_memberships_pkey', 'p', '{019e917c-df05-7be3-a5f7-b86b3a535db6}'),
  ('019e917c-df64-71e3-bb54-cb5493601cc6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-df4a-74aa-b218-a5cd5b8222f9', 'org_membership_defaults_pkey', 'p', '{019e917c-df57-7609-954d-59c8dbd38e41}'),
  ('019e917c-e060-7199-aeaa-4ffef24afa1f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e043-7ff2-8cfd-fdb539d8b720', 'org_membership_settings_pkey', 'p', '{019e917c-e051-7310-ae60-d9f2a0f735eb}'),
  ('019e917c-e235-7d0e-a891-e1f736da19e7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e216-7e98-ab47-351109e8153a', 'org_members_pkey', 'p', '{019e917c-e225-7cc2-bbcc-2e559c52b918}'),
  ('019e917c-e2d3-7e6c-b559-ee852b3d98ee', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e2b6-7c4d-b7e1-cd1d8ef03f35', 'org_admin_grants_pkey', 'p', '{019e917c-e2c5-7e74-a6c4-e9bfa2b26120}'),
  ('019e917c-e371-7afa-8a8f-e8a43ee6f75e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e355-760a-bf73-8c0cd756876b', 'org_owner_grants_pkey', 'p', '{019e917c-e363-7ee5-b34c-67bef8e273ea}'),
  ('019e917c-e410-7e1f-b9c8-329b7da1568f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e3f4-7880-a960-30c5f744c50f', 'org_member_profiles_pkey', 'p', '{019e917c-e403-7199-96f0-8501fd9cbea3}'),
  ('019e917c-e4fe-726c-ba46-adb373ab8913', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e4e0-76e6-8235-6d3566441276', 'org_grants_pkey', 'p', '{019e917c-e4ef-783f-8df0-dbcccf8702a2}'),
  ('019e917c-e611-74f5-a7da-e265e9a218d4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e5f3-7942-9dbd-8bfcd241a428', 'org_profiles_pkey', 'p', '{019e917c-e602-7933-b371-764ba1525be7}'),
  ('019e917c-e707-70c7-b395-936053515145', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e6cd-7f6f-b52c-711ef9ad4484', 'org_profile_permissions_pkey', 'p', '{019e917c-e6dc-77c5-9b36-69fb010181c5}'),
  ('019e917c-e78a-7282-98d9-b2c8ec94f933', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e76d-7caa-b924-3a3f414faf63', 'org_profile_grants_pkey', 'p', '{019e917c-e77c-71d8-a8b9-243433675f69}'),
  ('019e917c-e846-7b51-b0f2-4e39c7f394b9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e829-7aef-b2ec-e8cf17607173', 'org_profile_definition_grants_pkey', 'p', '{019e917c-e838-7843-b068-d99f9d822e54}'),
  ('019e917c-e933-794f-986d-9e8bdda89a8e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e914-76a7-b721-6add1de9fe69', 'org_profile_templates_pkey', 'p', '{019e917c-e923-7da5-9d1f-9739e34f9fe1}'),
  ('019e917c-eabe-7e4a-a364-d3d64dec1660', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e9d6-72dc-b719-a6d31f8f097b', 'org_events_pkey', 'p', '{019e917c-e9f9-7c0b-b9f2-7cdeb8b26cb3,019e917c-e9e6-781a-8737-13cd51f0a807}'),
  ('019e917c-eaef-7476-9cbd-bbc33a2f8b56', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eace-7e97-835e-13020e6d9194', 'org_event_aggregates_pkey', 'p', '{019e917c-eadf-7961-9290-cbae378cdc26}'),
  ('019e917c-ebbe-70f5-a999-42081b62d329', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eb9c-744c-a4a3-a66548d40bf0', 'org_event_types_pkey', 'p', '{019e917c-ebad-78ff-a1ad-99e557278e64}'),
  ('019e917c-ecb1-7ce0-bad1-6706aeb347c3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ec92-7ffa-9d03-863666d11e48', 'org_levels_pkey', 'p', '{019e917c-eca2-71f9-9723-0ee3715dbdc9}'),
  ('019e917c-ed63-7137-a4c2-e1817b02b8a2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ed41-7a47-a284-5fe7054ef7f6', 'org_level_requirements_pkey', 'p', '{019e917c-ed50-7d64-8373-a7a3dd827247}'),
  ('019e917c-ee2b-7aec-8d2d-ccaf8c5f581c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ee0c-72c4-93b3-e5dfafc558b2', 'org_level_grants_pkey', 'p', '{019e917c-ee1c-71ee-b6e4-dc58fee1728d}'),
  ('019e917c-eeda-75c3-a0a9-cfdcc7316116', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eeb9-719f-b97d-99fba880b1af', 'org_achievement_rewards_pkey', 'p', '{019e917c-eec9-73e9-a6c4-00e8d75a469e}'),
  ('019e917c-f514-759f-a629-a5db1be2ad64', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f4f2-7415-82e3-1b38f0540eb3', 'org_chart_edges_pkey', 'p', '{019e917c-f504-7070-8389-1311c306cc0d}'),
  ('019e917c-f619-7ecc-90e2-520cca0909bf', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f5c0-7754-9586-3d763f572262', 'org_hierarchy_sprts_pkey', 'p', '{019e917c-f5d4-77f3-ab55-b8e00ae3b5a4,019e917c-f5e5-7328-b67d-fb3ef18be604,019e917c-f5f5-7521-8c8d-1aafb901860e}'),
  ('019e917c-f65e-7e35-aa64-37553268e5ba', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f63c-7083-8d44-98f923225787', 'org_chart_edge_grants_pkey', 'p', '{019e917c-f64c-7f9d-9f13-2a356cf7eb69}'),
  ('019e917c-f874-76a3-b4c7-d7c6b7180812', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f818-79c1-aaf6-8dbe845fb23d', 'user_states_pkey', 'p', '{019e917c-f82d-7869-80db-b73b4a8161a3}'),
  ('019e917c-f92e-7296-a59b-ddad67cdee77', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f903-7594-9d4b-120a88330a0a', 'sessions_pkey', 'p', '{019e917c-f91b-77a8-a123-f5550d9d22b4}'),
  ('019e917c-fa5f-765c-88c2-108c3fa6a16a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fa3c-76fb-8569-554b1a4b8d0e', 'session_credentials_pkey', 'p', '{019e917c-fa4d-729d-9798-7c904361e9d1}'),
  ('019e917c-fb96-7f88-b28a-1ffdb324ad80', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fb74-715d-b16f-fadbd64d2e2c', 'app_settings_auths_pkey', 'p', '{019e917c-fb84-7fac-b3a5-db647772810a}'),
  ('019e917d-00d6-7855-8bf4-f2119fc95098', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-00b0-7db3-b665-3dc3b0e00260', 'session_secrets_pkey', 'p', '{019e917d-00c2-7f0d-9392-ce1b711fa3f7}'),
  ('019e917d-01ad-715d-8dee-5b58b5e88a61', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0185-7692-b0ed-68710575a9b5', 'app_settings_rate_limits_pkey', 'p', '{019e917d-0196-79be-8061-f06e08c9859d}'),
  ('019e917d-0329-7ea3-9012-2e8d109a9e12', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0304-72f7-9e10-d76721e2e685', 'auth_ip_rate_limits_pkey', 'p', '{019e917d-0316-7842-93ed-225baecef4ae}'),
  ('019e917d-040f-7e43-b28a-6b5f148bdbbc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-03e8-7269-b6b3-3a43f76942f2', 'auth_rate_limits_pkey', 'p', '{019e917d-03fb-780c-86c4-bd0abf4bdee3}'),
  ('019e917d-0585-7bf3-aca7-528bb828e987', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0558-71ab-b908-9360125ec648', 'app_namespaces_pkey', 'p', '{019e917d-056f-7f3a-838a-de23153c2ec6}'),
  ('019e917d-07a7-70cb-bb54-74c09da4d9ac', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0681-7994-aafe-ce0599f61fc6', 'app_namespace_events_pkey', 'p', '{019e917d-06af-7692-b467-8362e289f59a,019e917d-0696-7cf2-9cff-8bee69c2da21}'),
  ('019e917d-0987-74e4-8641-2bc3e47b1469', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-08e8-7b39-a720-f7005f011c33', 'user_secrets_pkey', 'p', '{019e917d-08fd-7e25-824d-736c2a666574}'),
  ('019e917d-0b7e-7eb9-90df-bdb834e36ada', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a53-794b-876d-af7f636589ff', 'app_secrets_pkey', 'p', '{019e917d-0a6b-7d7c-baea-15884957d890}'),
  ('019e917d-0cfb-7972-8937-638e42033213', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0c02-73fd-b716-b940e3899dbb', 'app_configs_pkey', 'p', '{019e917d-0c15-7fac-941e-51bd1f6ff783}'),
  ('019e917d-0e3b-7550-af2c-6101aa0a0c69', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0d4c-7a89-9385-66308b2c589c', 'app_config_definitions_pkey', 'p', '{019e917d-0d61-70e0-8afa-e6e984a5ffb6}'),
  ('019e917d-0fff-7950-a4ef-d969f0b36d81', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0fcc-715e-9816-b34b39bf6205', 'emails_pkey', 'p', '{019e917d-0fe4-7ef7-9b0d-0f155c6a9f87}'),
  ('019e917d-1214-7e90-aaaa-e778c5c47c26', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-11e2-7499-a4f8-4437c1de9ae3', 'app_invites_pkey', 'p', '{019e917d-11fd-77f8-a6e9-6cb2aa7f663d}'),
  ('019e917d-13b4-7585-b0a0-43c6b8f11074', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1387-7eaf-b9a0-a3258a40e55c', 'app_claimed_invites_pkey', 'p', '{019e917d-139d-7fc8-a8a7-0212572c4fc3}'),
  ('019e917d-1532-7a35-94bf-047cc3d57d77', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_pkey', 'p', '{019e917d-151b-769d-aafc-69d7628bf552}'),
  ('019e917d-1750-709c-a36d-bc9e1f90274e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1723-7668-9617-7d7873aac9cf', 'org_claimed_invites_pkey', 'p', '{019e917d-1738-78e1-9182-b0bb818a2dbb}'),
  ('019e917d-1a7f-77ee-8aba-e165e1c1b1da', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1942-72c9-bb43-47a0fe675632', 'audit_log_auths_pkey', 'p', '{019e917d-1a21-70a8-9014-7c5b6f3bac00,019e917d-195e-728f-8ad9-b5babd3ac35e}');


SET session_replication_role TO DEFAULT;


