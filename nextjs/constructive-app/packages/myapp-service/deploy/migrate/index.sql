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
  ('019e8c61-4a61-75f0-9963-77079587e88d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_search_tsv_gin_idx', '{019e8c61-4a54-74e2-ad34-4cb5470035c8}', '{}', 'GIN', NULL, NULL, false),
  ('019e8c61-4c02-729b-8b3d-c5ae1aebdf4d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bd8-7d41-9d0a-f604463e89b0', 'app_limits_actor_id_idx', '{019e8c61-4bf6-7f5e-826f-8e7cb47712b9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-4c99-75c9-8cea-5b26c51616aa', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4c7a-7eea-bd8e-899fe51ee383', 'app_limit_credits_default_limit_id_idx', '{019e8c61-4c8e-7188-9c0e-15e158443891}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-4ca5-7226-9bab-710b906dcf9c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4c7a-7eea-bd8e-899fe51ee383', 'app_limit_credits_actor_id_idx', '{019e8c61-4c9c-7bfb-b436-58d0b2bcefd7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5074-7d22-ad67-dde22df76d32', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-503d-7e0a-a121-47aa9cf3f5f5', 'app_memberships_sprts_actor_id_idx', '{019e8c61-506b-75e6-b8b2-73aadb9cdb96}', '{019e8c61-505f-7310-8d0b-d3f16f6de15c,019e8c61-5048-760c-bb52-53dc1f3b3915,019e8c61-5052-7d66-af96-8d6cb60cffb0}', 'BTREE', NULL, NULL, true),
  ('019e8c61-514f-7646-b918-b22e87b23dfe', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-511e-77e2-bdb5-2e3c9096e2cd', 'app_admin_grants_actor_id_idx', '{019e8c61-5142-7a10-852b-49ce8b367fe8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-515e-75af-ac70-1dd30de67bcf', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-511e-77e2-bdb5-2e3c9096e2cd', 'app_admin_grants_grantor_id_idx', '{019e8c61-5153-76c0-bf64-1b2b1d7473a1}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-51aa-718e-8db9-22ef758d9ea8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-517a-722c-a1b5-1c6d4207bd79', 'app_owner_grants_actor_id_idx', '{019e8c61-519c-7d52-8e29-ca8904bb9863}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-51b8-7712-88d7-9270ca51270e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-517a-722c-a1b5-1c6d4207bd79', 'app_owner_grants_grantor_id_idx', '{019e8c61-51ad-7c4c-bd69-c73e88558dcb}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-520f-7450-a115-17d274c06866', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-51cf-7e26-b72f-778ec6e91887', 'app_grants_actor_id_idx', '{019e8c61-5201-75e0-a19f-93d8666dccd7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-521e-739f-83c7-a1653dfc6c65', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-51cf-7e26-b72f-778ec6e91887', 'app_grants_grantor_id_idx', '{019e8c61-5213-74b1-8a0b-d628cd1df771}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-52e9-7b6b-9b4d-64ce72191423', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-52b4-7b36-8d3b-53f925594eec', 'app_events_actor_id_idx', '{019e8c61-52db-74d0-9840-c51a8d232f9a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5304-74bd-a4a1-0a86ffd6d019', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-52b4-7b36-8d3b-53f925594eec', 'app_events_actor_id_name_idx', '{019e8c61-52db-74d0-9840-c51a8d232f9a,019e8c61-52ee-71d4-a4a3-1ca0ad7fb0ad}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5384-72fe-9ce9-56f6225365a3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5355-7984-b207-6afa488ec116', 'app_event_aggregates_actor_id_idx', '{019e8c61-5375-7e3b-861d-cfa55cfadc4e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-54b1-7532-8cae-52b8e557cd0d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5467-730c-adec-c4346e6f4432', 'app_levels_owner_id_idx', '{019e8c61-54a6-7030-8fb6-a921b7034b8c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5531-7175-8e26-ae2341b5ded7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-54d3-7677-8d3b-2c196ed62bd4', 'app_level_requirements_level_idx', '{019e8c61-5500-7076-b062-18ec36e4d377}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5535-7bb3-a8f9-a77b13bd247c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-54d3-7677-8d3b-2c196ed62bd4', 'app_level_requirements_name_level_priority_idx', '{019e8c61-54f4-778b-a4a4-6857779e8f4b,019e8c61-5500-7076-b062-18ec36e4d377,019e8c61-551e-7790-be1b-078dd8d2c99d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5582-7ae3-9361-70174c6754aa', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5551-7fac-ac23-d57eecc4b075', 'app_level_grants_actor_id_idx', '{019e8c61-5571-743a-93cb-0ae71f428a2a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5613-7b71-97a7-861810877df9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-55ba-7f88-9123-5278b63aba33', 'app_achievement_rewards_level_name_idx', '{019e8c61-55d9-740a-a27e-bb417513a322}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5781-7c9d-aa23-9aa86035a671', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56ef-783c-8673-192363215116', 'app_profiles_is_default_idx', '{019e8c61-5751-78e0-b7eb-31fcf8329345}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-57ce-7d1c-ad9d-922b6beab63b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-578a-7b7a-bafa-3b0aaebd206e', 'app_profile_permissions_permission_id_idx', '{019e8c61-57bd-731c-a69a-c53fc978f602}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-57d8-7613-bfe6-f427d209ec82', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-578a-7b7a-bafa-3b0aaebd206e', 'app_profile_permissions_profile_id_idx', '{019e8c61-57ab-72e2-880c-14b2ad325055}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5840-7ed2-93a3-8644896612a2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-57f7-7a2b-871f-3b4be12acdbe', 'app_profile_grants_grantor_id_idx', '{019e8c61-5834-748e-b2cd-ac8f014dad84}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5852-7a7c-a77d-5070957aaba8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-57f7-7a2b-871f-3b4be12acdbe', 'app_profile_grants_membership_id_idx', '{019e8c61-5817-7df0-893b-5ca8d806d338}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5857-72ce-adea-08a81a820813', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-57f7-7a2b-871f-3b4be12acdbe', 'app_profile_grants_profile_id_idx', '{019e8c61-5827-7784-8e97-f31a8feb04a2}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-58c4-7cf6-bda3-e275e85dd962', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5875-70c7-a16d-79332a3c8b3d', 'app_profile_definition_grants_grantor_id_idx', '{019e8c61-58b7-745a-9571-1fdd7020b24e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-58d7-7626-b38c-5bd2e8eb522b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5875-70c7-a16d-79332a3c8b3d', 'app_profile_definition_grants_profile_id_idx', '{019e8c61-5894-7c97-9c6c-a1e1ca31cc94}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-58db-7da5-8fd5-8ddc97424796', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5875-70c7-a16d-79332a3c8b3d', 'app_profile_definition_grants_permission_id_idx', '{019e8c61-58a4-78b3-8570-cb2414a2db43}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5905-7ac6-8fe8-20ca08511f9a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4fc4-712d-aa74-ec2f43200cab', 'app_memberships_profile_id_idx', '{019e8c61-58fb-70a9-a269-1340e87d598b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-59be-726a-b4f5-bbdd42204f43', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5939-739e-9277-e6670e481724', 'app_profile_templates_is_default_idx', '{019e8c61-5987-7bad-b1c3-0fb0a2256693}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5df7-7b85-b0ff-ccc81822dc7f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5dae-7cd7-bd66-799cf0f6fb7a', 'org_permission_defaults_entity_id_idx', '{019e8c61-5de4-7816-9a12-ecd0d3e7ae14}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5e43-7606-b89c-672e10b7b843', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5e00-7e1a-8427-d7008b86d5ae', 'org_limits_actor_id_idx', '{019e8c61-5e30-7f94-ab7b-01327e14d867}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5ea6-760f-97b5-eb35507d74dd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5e00-7e1a-8427-d7008b86d5ae', 'org_limits_entity_id_idx', '{019e8c61-5e96-7f50-b88d-5e17011756d7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5f68-74e9-9e38-56c02b8cc803', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5f2d-7e56-be7b-c87789bd7a25', 'org_limit_credits_default_limit_id_idx', '{019e8c61-5f55-7610-a730-da1e85c1eaae}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5f7d-782d-9d60-9dad5ad3b966', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5f2d-7e56-be7b-c87789bd7a25', 'org_limit_credits_actor_id_idx', '{019e8c61-5f6d-7b75-9af4-d54dddd02931}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-5f93-76ff-8bb6-7516f24bb63e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5f2d-7e56-be7b-c87789bd7a25', 'org_limit_credits_entity_id_idx', '{019e8c61-5f82-7f76-8fa4-bc423fcc3132}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6041-70e9-98c9-f61f4a387711', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5ff8-7fe4-bf7a-8cc5c9613c30', 'org_limit_aggregates_entity_id_idx', '{019e8c61-602b-7f72-8555-592680eaef76}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-64d0-7b4e-b300-92d2924a2577', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6463-76fa-b23a-e6f88fe8be48', 'org_memberships_sprts_actor_id_entity_id_idx', '{019e8c61-64a6-7174-8df6-c756808a1191,019e8c61-64b3-7053-9b53-02d624c2c1ef}', '{019e8c61-6494-7c14-b1e4-fc825a679a3e}', 'BTREE', NULL, NULL, true),
  ('019e8c61-64d6-785f-8882-0689d95eb17e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6463-76fa-b23a-e6f88fe8be48', 'org_memberships_sprts_actor_id_idx', '{019e8c61-64a6-7174-8df6-c756808a1191}', '{019e8c61-6494-7c14-b1e4-fc825a679a3e,019e8c61-6471-7094-8290-e55334d46a6b,019e8c61-6483-72ba-bbdd-38e67be1b21c,019e8c61-64c0-74e4-94b5-ca334ed84076}', 'BTREE', NULL, NULL, false),
  ('019e8c61-64db-7d53-99b7-97fe5682a080', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6463-76fa-b23a-e6f88fe8be48', 'org_memberships_sprts_entity_id_idx', '{019e8c61-64b3-7053-9b53-02d624c2c1ef}', '{019e8c61-6494-7c14-b1e4-fc825a679a3e,019e8c61-6471-7094-8290-e55334d46a6b,019e8c61-6483-72ba-bbdd-38e67be1b21c,019e8c61-64c0-74e4-94b5-ca334ed84076}', 'BTREE', NULL, NULL, false),
  ('019e8c61-66e9-746a-b8d4-54175edcc677', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-63ae-7d74-bf87-6db6c15e3e34', 'org_memberships_actor_id_idx', '{019e8c61-66b6-7b80-996f-d24a0fc2a1b9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-66ee-7ce2-8518-fcb836536a92', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-63ae-7d74-bf87-6db6c15e3e34', 'org_memberships_entity_id_idx', '{019e8c61-66cc-76f8-aa82-8f0b6652e1b9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6772-79b5-900c-5d81aba2b5b9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6707-7bc3-bd66-1f33bb4c29ff', 'org_members_actor_id_idx', '{019e8c61-6741-7345-96d2-36f20ed4b701}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6777-7eb4-8c0d-becdbe069780', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6707-7bc3-bd66-1f33bb4c29ff', 'org_members_entity_id_idx', '{019e8c61-6757-74fb-a0f5-0ffecad4b464}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6801-7c30-a9ff-90b32bea89c1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-67ac-7c35-888b-509bf3c4ed47', 'org_admin_grants_actor_id_idx', '{019e8c61-67eb-7326-8e45-82dc7a2e84c4}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-681f-7d72-a5f6-ba87bf49b575', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-67ac-7c35-888b-509bf3c4ed47', 'org_admin_grants_entity_id_idx', '{019e8c61-6808-73a7-b726-2a8ef244d35e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6836-777d-8fe6-fd42c3a88a43', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-67ac-7c35-888b-509bf3c4ed47', 'org_admin_grants_grantor_id_idx', '{019e8c61-6825-76c8-9131-3d1d480b5c31}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-68ae-7b26-bdb3-e37f7ef0c807', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-685c-792b-8809-e7039d0ec228', 'org_owner_grants_actor_id_idx', '{019e8c61-6899-7fe3-9ca3-e95b7777131e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-68ca-7835-916f-e7082b3712fc', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-685c-792b-8809-e7039d0ec228', 'org_owner_grants_entity_id_idx', '{019e8c61-68b4-7d56-b835-94e0dd6a517e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-68e2-7cc4-adc1-af253be784b1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-685c-792b-8809-e7039d0ec228', 'org_owner_grants_grantor_id_idx', '{019e8c61-68d0-750c-b9cf-5030b863427c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6988-7a50-9276-374774247c50', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-690a-70a9-8174-fca6ea09deab', 'org_member_profiles_entity_id_idx', '{019e8c61-6973-78bd-b39a-30de7a8f8199}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-69a6-7ad4-9626-55d2c294bea2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-690a-70a9-8174-fca6ea09deab', 'org_member_profiles_actor_id_idx', '{019e8c61-698e-74c1-86a7-5d433534f1dc}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6a74-7dac-8822-3e94e8e5c306', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6a0c-7af3-a0e8-8f1210dee00e', 'org_grants_actor_id_idx', '{019e8c61-6a5f-7142-ab5c-e2a1ed51f45b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6a90-74da-a1d8-a85e8bd725c7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6a0c-7af3-a0e8-8f1210dee00e', 'org_grants_entity_id_idx', '{019e8c61-6a7a-7dd4-874f-e39f95328051}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6aa8-7f45-b9cf-9dbaab7b4d64', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6a0c-7af3-a0e8-8f1210dee00e', 'org_grants_grantor_id_idx', '{019e8c61-6a96-70d6-a7c6-dec2320d54f4}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6bfd-70d0-a3ef-62ff9929646e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6b2b-7d4e-bc96-61bac654e74d', 'org_profiles_entity_id_idx', '{019e8c61-6bea-730d-9239-7607da0c3b9a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6c15-7b1b-82e8-8ee0bb178d8e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6b2b-7d4e-bc96-61bac654e74d', 'org_profiles_is_default_idx', '{019e8c61-6bb2-7fb7-b23a-4ea94b053858}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6cad-7421-9f63-10e5619404f8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6c28-7345-b0e9-281835706d68', 'org_profile_permissions_permission_id_idx', '{019e8c61-6c93-7d59-89cc-67f4a51dd627}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6cb9-7a32-b877-d7d81b43f317', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6c28-7345-b0e9-281835706d68', 'org_profile_permissions_profile_id_idx', '{019e8c61-6c71-7e5b-9c24-32e81b4b3aad}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6d50-701f-ad89-573ce64b4151', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6ce3-71b6-a7f0-67c83ff6f5b5', 'org_profile_grants_entity_id_idx', '{019e8c61-6d3d-74b7-a7f0-a6ffd25662c8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6d67-7d92-9381-2d0568cfd948', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6ce3-71b6-a7f0-67c83ff6f5b5', 'org_profile_grants_grantor_id_idx', '{019e8c61-6d56-741c-bbf2-5edf5df1ea52}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6d81-741e-82c0-6c1237dddc4a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6ce3-71b6-a7f0-67c83ff6f5b5', 'org_profile_grants_membership_id_idx', '{019e8c61-6d12-7af6-ae47-d9895e4bdd58}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6d87-734d-b75e-b52f8f0f1507', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6ce3-71b6-a7f0-67c83ff6f5b5', 'org_profile_grants_profile_id_idx', '{019e8c61-6d2a-7831-9284-737ede09917a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6e1e-7085-818b-46438d908d59', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6daf-7ef0-9cfa-fc9ccb1d0d2a', 'org_profile_definition_grants_grantor_id_idx', '{019e8c61-6e0b-74a2-bfe7-df51130e9a64}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6e3a-7a5e-a253-fe539705c802', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6daf-7ef0-9cfa-fc9ccb1d0d2a', 'org_profile_definition_grants_profile_id_idx', '{019e8c61-6ddf-7420-a455-323df931c53f}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6e40-7b40-a3c5-4062958ed7af', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6daf-7ef0-9cfa-fc9ccb1d0d2a', 'org_profile_definition_grants_permission_id_idx', '{019e8c61-6df4-7e13-aede-8ed9767a64d7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6e75-7d62-a45c-e3e2601690a8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-63ae-7d74-bf87-6db6c15e3e34', 'org_memberships_profile_id_idx', '{019e8c61-6e66-7c22-baa3-d7f1ac5ca375}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6f69-7b88-b0db-dbb4cdb2345a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6eb0-7cfc-b926-e3c23f2ff1a3', 'org_profile_templates_is_default_idx', '{019e8c61-6f1f-798a-9435-c644b5954e3e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-6fd0-7ead-a822-66746e8c3cca', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6f7e-7b17-80e6-ddace807cb67', 'org_events_actor_id_idx', '{019e8c61-6fb3-774a-b792-1de13a99db42}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7023-7388-8b6d-74e50c16be44', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6f7e-7b17-80e6-ddace807cb67', 'org_events_actor_id_name_entity_id_idx', '{019e8c61-6fb3-774a-b792-1de13a99db42,019e8c61-6fd6-7e0c-a4a4-0ed5c5233c65,019e8c61-6ffa-73b1-8481-7608ecfba42c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7029-7072-b483-0e0e2a667170', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6f7e-7b17-80e6-ddace807cb67', 'org_events_entity_id_idx', '{019e8c61-6ffa-73b1-8481-7608ecfba42c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-70d7-75f4-9ffd-b5dd529cdfe1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7091-718e-ac95-1725d47ff3b8', 'org_event_aggregates_actor_id_idx', '{019e8c61-70c0-7a75-87a2-b153f0d0382f}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7143-713b-842a-7abf2376e8ba', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7091-718e-ac95-1725d47ff3b8', 'org_event_aggregates_entity_id_idx', '{019e8c61-7111-77dd-840b-f3d9dc6b1f27}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7248-7967-b347-3b3bbc7b5850', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-716c-73c2-b358-28000c37fdc9', 'org_event_types_entity_id_idx', '{019e8c61-722b-7c66-9925-525adab8778e}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-72f8-7c2a-84a2-581f047e6de8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7274-7d04-b498-89d146b1467c', 'org_levels_owner_id_idx', '{019e8c61-72e0-76b4-a53a-67031fe15e15}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-731c-7a59-9b99-8111a1f4dd6f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7274-7d04-b498-89d146b1467c', 'org_levels_entity_id_idx', '{019e8c61-72ff-739c-974f-78a6abfbe983}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-73f5-7741-ad97-97df7b286af0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7348-70b8-89dc-676ca5c385c2', 'org_level_requirements_entity_id_idx', '{019e8c61-73d9-75b6-8ad2-de0b2d34d40d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-73fc-72d2-ab31-a6d6eab55a78', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7348-70b8-89dc-676ca5c385c2', 'org_level_requirements_level_idx', '{019e8c61-7391-7da6-8f74-b10e8f854f0c}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7403-7e3c-95b3-1c247dc71e7f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7348-70b8-89dc-676ca5c385c2', 'org_level_requirements_name_level_priority_idx', '{019e8c61-737d-7eb4-8569-a67703453bb9,019e8c61-7391-7da6-8f74-b10e8f854f0c,019e8c61-73c4-7abe-b369-b18612b305eb}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-747f-7a4f-83b7-2aab1e3cb82a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7433-7839-96cb-13e23adcfe1d', 'org_level_grants_actor_id_idx', '{019e8c61-7466-7bd7-a397-3da6cdc57f08}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-74c6-7a43-9966-30e2740888ee', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7433-7839-96cb-13e23adcfe1d', 'org_level_grants_entity_id_idx', '{019e8c61-74ab-7fe6-897b-31a7d2ef8c26}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-75a0-7fca-961e-6c7c68fd0fbd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-74f3-711a-b865-71e639802fbe', 'org_achievement_rewards_entity_id_idx', '{019e8c61-758d-7376-83c9-c4b758f3388d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-75a7-7100-9a52-c531f03d5cef', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-74f3-711a-b865-71e639802fbe', 'org_achievement_rewards_level_name_idx', '{019e8c61-7528-7148-be64-15276f90f83d}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7c31-7049-bbea-8dcd14cc0dbe', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', 'org_chart_edges_entity_id_idx', '{019e8c61-7bc5-7deb-8b09-972e2b096254}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7c37-7d0d-b740-569dd5182d8c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', 'org_chart_edges_parent_id_idx', '{019e8c61-7bfb-7222-8e6f-85641aebbd0a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7c3e-79f1-93e2-7d6f73906570', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', 'org_chart_edges_child_id_idx', '{019e8c61-7be0-7aff-9c9d-5ebc494ce462}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7cb4-7195-82e2-c98079957d22', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7c4c-7ca8-b291-cca8a2d6b489', 'org_hierarchy_sprts_entity_id_ancestor_id_idx', '{019e8c61-7c61-7ef9-889d-a449d86f6dbf,019e8c61-7c75-7a3a-bf5b-65f6025e2bef}', '{019e8c61-7c98-70fe-8e07-89a307f4120b}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7cba-7e52-a4f5-bed2f9e26709', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7c4c-7ca8-b291-cca8a2d6b489', 'org_hierarchy_sprts_entity_id_descendant_id_idx', '{019e8c61-7c61-7ef9-889d-a449d86f6dbf,019e8c61-7c86-7897-aab1-feb9485bc614}', '{019e8c61-7c98-70fe-8e07-89a307f4120b}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7cc1-78af-ab34-dd00af2f0422', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7c4c-7ca8-b291-cca8a2d6b489', 'org_hierarchy_sprts_ancestor_id_idx', '{019e8c61-7c75-7a3a-bf5b-65f6025e2bef}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7cc7-7f09-97a4-b826e4fcf1d4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7c4c-7ca8-b291-cca8a2d6b489', 'org_hierarchy_sprts_descendant_id_idx', '{019e8c61-7c86-7897-aab1-feb9485bc614}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7da5-7700-b1bc-70a09f50bdd0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7cce-7aa0-8687-c300d471037e', 'org_chart_edge_grants_entity_id_idx', '{019e8c61-7d02-73ab-83a8-e4965270aa42}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7dac-75cf-afe3-9fb714176777', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7cce-7aa0-8687-c300d471037e', 'org_chart_edge_grants_child_id_idx', '{019e8c61-7d1a-7fe3-ae54-a4ff49c21e11}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7db3-7256-ba7c-e1175bfd9548', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7cce-7aa0-8687-c300d471037e', 'org_chart_edge_grants_parent_id_idx', '{019e8c61-7d34-73ce-9e34-04861c5b5be8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-7db9-7a51-b020-040b80679879', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7cce-7aa0-8687-c300d471037e', 'org_chart_edge_grants_grantor_id_idx', '{019e8c61-7d48-716b-a7fb-c3d89440c85b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-80f2-717b-b9eb-9a482a6483ae', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7fbb-7954-aa15-04256bba1ce7', 'sessions_user_id_idx', '{019e8c61-7ff1-7fbb-b361-1ba47a71a80a}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8233-7a02-a317-d10fe75e9151', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-80f9-7177-a2b7-a4f11931b9e7', 'session_credentials_session_id_idx', '{019e8c61-8128-7e0a-831f-44ed7bcc3cc9}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-823a-74b3-b801-e6e191562f14', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-80f9-7177-a2b7-a4f11931b9e7', 'session_credentials_kind_idx', '{019e8c61-813b-74e5-a54f-765e76dde739}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8814-7f4b-ad6e-d36916d667bd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-87c9-7b47-9e9a-03420e45641f', 'session_secrets_session_id_idx', '{019e8c61-87f9-72d0-8ca1-a621ce2a59db}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8b20-73e0-ad51-fa3e52b5dcae', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8a3e-7402-bd69-608d4353836e', 'auth_ip_rate_limits_ip_address_idx', '{019e8c61-8a6f-78c7-8dd1-7ef1469c4d95}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8b27-76b7-bfbe-96c89f748eb6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8a3e-7402-bd69-608d4353836e', 'auth_ip_rate_limits_locked_until_idx', '{019e8c61-8adb-7af0-bb48-a09bee7c657b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8c08-7e57-b18a-917f558461a0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8b2e-7907-9377-1e7220947ae7', 'auth_rate_limits_subject_id_idx', '{019e8c61-8b5f-7d68-ba16-2631a72fc7e8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8c10-71a7-8d16-e7c4287dbbdb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8b2e-7907-9377-1e7220947ae7', 'auth_rate_limits_locked_until_idx', '{019e8c61-8bc2-7225-a309-954601f03dc3}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-8f1c-7103-98b5-b7b3c97ffcd7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8dd1-7ea4-b9c5-8758daeb1446', 'app_namespace_events_namespace_id_created_at_idx', '{019e8c61-8e10-7406-b2f9-a7bfa61f598e,019e8c61-8e00-7ff7-9486-aebb3eefa1c8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9858-7bb8-a216-29f4a7dfdba6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-97f3-7e65-b577-738d989cde95', 'emails_owner_id_idx', '{019e8c61-9837-751f-90d9-c730bf4c2265}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9be5-75c1-9125-274a5b37dc50', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9a34-748a-acf4-fb0ded800aa4', 'app_invites_expires_at_idx', '{019e8c61-9b80-7eda-9413-23f3e3ce68a4}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9bed-7db9-86d7-b9639ef07570', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9a34-748a-acf4-fb0ded800aa4', 'app_invites_invite_valid_idx', '{019e8c61-9ada-7809-a846-af03b1d08a67}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9bf5-7be4-80e8-25606094caca', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9a34-748a-acf4-fb0ded800aa4', 'app_invites_sender_id_idx', '{019e8c61-9a9e-7b15-9cbf-b3daeff2a2f8}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9cc9-757e-9fa7-84c71d5eb84c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9c07-7804-ad65-589cba79f737', 'app_claimed_invites_sender_id_idx', '{019e8c61-9c61-75d3-a78d-a62103c3a76b}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9cd1-7801-a4c3-f72fd9a1e8d6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9c07-7804-ad65-589cba79f737', 'app_claimed_invites_receiver_id_idx', '{019e8c61-9c71-7448-a954-8e407e4e1427}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9f7e-7cc4-b0eb-dcb09f8b85bb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_entity_id_idx', '{019e8c61-9f63-725d-81a9-97dddb9c64a2}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9f91-7cf6-8eb3-989b70e3587d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_expires_at_idx', '{019e8c61-9f09-7f1f-a789-e1f319e28f4f}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9f9b-7208-adad-964dfedb47f9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_invite_valid_idx', '{019e8c61-9e39-7423-a0ef-71ccd331765f}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9fa3-772b-b174-6a9ee19213b6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_sender_id_idx', '{019e8c61-9dec-7c64-aa5e-c3f2b22e89c5}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-9fc3-77bb-b30e-7141eb824d9a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_receiver_id_idx', '{019e8c61-9e09-7b1c-961d-9f2ddcdf17b5}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-a08e-719f-87a5-8ae45596e00a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9fcc-7296-8afa-7b85b7ea7212', 'org_claimed_invites_sender_id_idx', '{019e8c61-a027-785d-baf1-50622056ab75}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-a096-7e4c-a704-fee33611ed2e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9fcc-7296-8afa-7b85b7ea7212', 'org_claimed_invites_receiver_id_idx', '{019e8c61-a036-749f-b760-f0305a635404}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-a0c7-75ca-8f85-9182d118844c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9fcc-7296-8afa-7b85b7ea7212', 'org_claimed_invites_entity_id_idx', '{019e8c61-a0a8-7ed9-b972-4d318b102074}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-a2c2-75b1-a22c-592ded7b3c20', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a206-732d-a4ca-52ebc3829b4c', 'audit_log_auths_event_idx', '{019e8c61-a243-7aba-b32a-9aeb829b9fe7}', '{}', 'BTREE', NULL, NULL, false),
  ('019e8c61-a2d6-747a-b2f1-a6ed08a3e6b2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a206-732d-a4ca-52ebc3829b4c', 'audit_log_auths_actor_id_idx', '{019e8c61-a25f-7dcb-be25-6e759f2cbd6f}', '{}', 'BTREE', NULL, NULL, false);


SET session_replication_role TO DEFAULT;


