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
  ('019e8c61-4a3b-7217-b136-43b14a7b0b5b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_pkey', 'p', '{019e8c61-4a30-7015-bd49-acf986694623}'),
  ('019e8c61-4a70-79b7-877b-6bd20c696337', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a65-78b2-90d8-4740b1f7b87d', 'role_types_pkey', 'p', '{019e8c61-4a6c-783c-bbf0-b0d28b936754}'),
  ('019e8c61-4acd-79d4-a743-785f88d81241', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aba-7c8f-bae5-da3c8761cf13', 'membership_types_pkey', 'p', '{019e8c61-4ac6-79b0-a767-fd8750f7f6ce}'),
  ('019e8c61-4b41-7540-8b30-bbfac20b8456', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b2f-7ad3-a010-1dcc0f3134fb', 'app_permissions_pkey', 'p', '{019e8c61-4b39-7c78-ac51-82416079e0f0}'),
  ('019e8c61-4b95-7689-8389-943716950699', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b86-7991-a627-50f2aaf13185', 'app_permission_defaults_pkey', 'p', '{019e8c61-4b8f-714b-a6c6-4d4c522310d6}'),
  ('019e8c61-4bec-7011-8b03-1cf19b0e5991', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bd8-7d41-9d0a-f604463e89b0', 'app_limits_pkey', 'p', '{019e8c61-4be3-7b73-814b-88cd84ed8f8a}'),
  ('019e8c61-4c48-7e1b-bc27-5eda419c2e4f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4c3a-791b-a4c7-3724b8d48bab', 'app_limit_defaults_pkey', 'p', '{019e8c61-4c42-7759-b4ca-820f98503c8f}'),
  ('019e8c61-4c8a-7989-a228-ec36a3c3ef02', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4c7a-7eea-bd8e-899fe51ee383', 'app_limit_credits_pkey', 'p', '{019e8c61-4c83-794d-becf-5e90c385ae95}'),
  ('019e8c61-4d29-750f-b94d-4ab2976e4653', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4cd7-7c06-aacd-a6985e6cae3f', 'app_limit_events_pkey', 'p', '{019e8c61-4cee-7c0a-95c1-82c04a521237,019e8c61-4ce3-79d1-86e3-494ccfbbb3f0}'),
  ('019e8c61-4d7b-7c91-a83c-09ff5a9cc88d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4d6a-7811-b6a4-ce3ffd4a4d90', 'app_limit_credit_codes_pkey', 'p', '{019e8c61-4d74-7006-b0c5-168142bc1438}'),
  ('019e8c61-4dc0-762c-816c-9f9af8e041a7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4daf-76cc-9be1-46c0be7e746e', 'app_limit_credit_code_items_pkey', 'p', '{019e8c61-4db8-76df-8237-4008e0163f55}'),
  ('019e8c61-4e0d-7169-aaff-e7973e783512', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4dfd-74b3-8fe3-1635a6e96a48', 'app_limit_credit_redemptions_pkey', 'p', '{019e8c61-4e05-7e6f-9c4d-ed5d63e601f7}'),
  ('019e8c61-4e58-71d7-91b0-db66fc7a5bce', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4e46-7557-9fe4-5dbfdca44f4f', 'app_limit_caps_defaults_pkey', 'p', '{019e8c61-4e50-74c9-971e-0bd7fb1bd7d4}'),
  ('019e8c61-4e82-7a77-97c8-f4bd17486db5', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4e72-7154-b244-1c6f81472aec', 'app_limit_caps_pkey', 'p', '{019e8c61-4e7a-7cd6-83a4-8e526e0f9f32}'),
  ('019e8c61-4ec4-7444-aa82-24581428bacf', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4eb3-7482-8798-8375e51a49bc', 'app_limit_warnings_pkey', 'p', '{019e8c61-4ebc-78f9-9e00-897c057e94c2}'),
  ('019e8c61-4f00-7317-a02f-537a5bc9e7a0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4eef-77a0-a8ef-d9805bab42f1', 'app_limit_warning_states_pkey', 'p', '{019e8c61-4ef8-7a4b-8d78-dcc24d58f138}'),
  ('019e8c61-4fde-73cc-b6d5-d982038a0feb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4fc4-712d-aa74-ec2f43200cab', 'app_memberships_pkey', 'p', '{019e8c61-4fd3-7b48-b66e-5609af94a048}'),
  ('019e8c61-5016-7e29-a54b-91e68cef1cb3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5003-7dd6-bc23-3d550e167966', 'app_membership_defaults_pkey', 'p', '{019e8c61-500e-7765-ba29-d4f8be441268}'),
  ('019e8c61-5131-7f30-9756-588380994d30', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-511e-77e2-bdb5-2e3c9096e2cd', 'app_admin_grants_pkey', 'p', '{019e8c61-5129-778b-8595-b1505c1ddfe6}'),
  ('019e8c61-518d-7d33-aa82-781f45bbde75', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-517a-722c-a1b5-1c6d4207bd79', 'app_owner_grants_pkey', 'p', '{019e8c61-5185-72ce-80fc-d052a0c96aef}'),
  ('019e8c61-51e4-7218-9841-0770a07fa3a9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-51cf-7e26-b72f-778ec6e91887', 'app_grants_pkey', 'p', '{019e8c61-51da-7f90-8435-1a8c31f3813d}'),
  ('019e8c61-5349-7675-b385-b3ea6d649f74', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-52b4-7b36-8d3b-53f925594eec', 'app_events_pkey', 'p', '{019e8c61-52d8-71ee-82be-7b88414821d6,019e8c61-52ca-7d02-9fa4-5ca7cfe20630}'),
  ('019e8c61-5370-7e53-b9af-9cfd1a59e7e3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5355-7984-b207-6afa488ec116', 'app_event_aggregates_pkey', 'p', '{019e8c61-5366-776c-9566-2dd12ecb6086}'),
  ('019e8c61-53da-7531-87c4-2db209bb0cd6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-53bf-7e3f-98b4-b4f4f63097a1', 'app_event_types_pkey', 'p', '{019e8c61-53cf-7877-9601-437b361ab474}'),
  ('019e8c61-5485-7716-b8e4-baa43b704f90', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5467-730c-adec-c4346e6f4432', 'app_levels_pkey', 'p', '{019e8c61-547a-737c-bd06-3f23933350c7}'),
  ('019e8c61-54ef-7649-aa53-cff5da721be4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-54d3-7677-8d3b-2c196ed62bd4', 'app_level_requirements_pkey', 'p', '{019e8c61-54e4-7f48-a4b3-2737ec7d8649}'),
  ('019e8c61-556c-76b6-b3d4-1682fe8c2889', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5551-7fac-ac23-d57eecc4b075', 'app_level_grants_pkey', 'p', '{019e8c61-5562-7d2e-a2bf-0c581b3325b5}'),
  ('019e8c61-55d4-77a1-a0f8-51ddfd9b75c4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-55ba-7f88-9123-5278b63aba33', 'app_achievement_rewards_pkey', 'p', '{019e8c61-55ca-770c-86d7-5f1dc148963d}'),
  ('019e8c61-570f-778d-aff5-e4876989d3e3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56ef-783c-8673-192363215116', 'app_profiles_pkey', 'p', '{019e8c61-5702-79da-ab26-186be690e780}'),
  ('019e8c61-57a5-7f12-97c8-4038856b03fd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-578a-7b7a-bafa-3b0aaebd206e', 'app_profile_permissions_pkey', 'p', '{019e8c61-579b-72e3-8d35-a50024573de7}'),
  ('019e8c61-5812-799e-8a88-de29a0c402b5', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-57f7-7a2b-871f-3b4be12acdbe', 'app_profile_grants_pkey', 'p', '{019e8c61-5808-741f-a51e-aa20e242f753}'),
  ('019e8c61-588f-7681-91e1-7c39da023017', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5875-70c7-a16d-79332a3c8b3d', 'app_profile_definition_grants_pkey', 'p', '{019e8c61-5885-70d8-8376-c1e5c96b254a}'),
  ('019e8c61-5954-745e-98eb-1a6a91de19f4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5939-739e-9277-e6670e481724', 'app_profile_templates_pkey', 'p', '{019e8c61-5949-778d-bff2-881431ac9ec1}'),
  ('019e8c61-5d49-7d89-af9e-09ab70b1edcd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5d29-7de0-981d-5a7f07ee34b9', 'org_permissions_pkey', 'p', '{019e8c61-5d3d-7d10-9fe5-66dd9c71966f}'),
  ('019e8c61-5dcf-73e5-b99b-5c2aa98d4f45', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5dae-7cd7-bd66-799cf0f6fb7a', 'org_permission_defaults_pkey', 'p', '{019e8c61-5dc3-7697-9e97-03006ddbd7b4}'),
  ('019e8c61-5e1e-7f2d-8a74-1148fff8b61b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5e00-7e1a-8427-d7008b86d5ae', 'org_limits_pkey', 'p', '{019e8c61-5e13-75b5-b360-b245b534209d}'),
  ('019e8c61-5ee3-71ae-be4f-524eecaeb30f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5ec2-79dd-ae45-369bec5e7a4d', 'org_limit_defaults_pkey', 'p', '{019e8c61-5ed4-7337-8a17-457f9c181b0c}'),
  ('019e8c61-5f4e-75ad-bce4-f59809a79f07', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5f2d-7e56-be7b-c87789bd7a25', 'org_limit_credits_pkey', 'p', '{019e8c61-5f3e-799a-bfb6-ec938a403fc5}'),
  ('019e8c61-601b-701f-ade9-59122888c263', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5ff8-7fe4-bf7a-8cc5c9613c30', 'org_limit_aggregates_pkey', 'p', '{019e8c61-600b-7ca8-9b04-5cbc5227de35}'),
  ('019e8c61-619b-7aed-8ca4-c545db133140', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-60ed-7487-85c1-fc02b4eb19eb', 'org_limit_events_pkey', 'p', '{019e8c61-6111-7d56-95f2-689519adc25f,019e8c61-6101-7879-87ce-1d403069b9f8}'),
  ('019e8c61-6216-7e39-823e-ac98fa911844', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-61f7-778d-be47-7ede5dbdfcbf', 'org_limit_caps_defaults_pkey', 'p', '{019e8c61-620a-7487-b872-bc8b36f0b493}'),
  ('019e8c61-626d-7992-8b68-d387507ca9a9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6246-79b6-a317-690744b8b932', 'org_limit_caps_pkey', 'p', '{019e8c61-625e-72f4-ad0e-ed5dd6662cc9}'),
  ('019e8c61-62dd-757d-bd1c-38d0e482860c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-62bd-7e45-85f6-37a07c1fc9dc', 'org_limit_warnings_pkey', 'p', '{019e8c61-62ce-7ca1-86ed-b7edc561a9b2}'),
  ('019e8c61-634f-71ff-85b3-4e9adb596f7d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6334-7fef-8d30-a8cafaec05f7', 'org_limit_warning_states_pkey', 'p', '{019e8c61-6341-7d8b-9eb0-0d1310249993}'),
  ('019e8c61-63cf-704c-87d2-5d8fc1eb1a6f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-63ae-7d74-bf87-6db6c15e3e34', 'org_memberships_pkey', 'p', '{019e8c61-63c0-747f-b9b1-4e8290d570d5}'),
  ('019e8c61-642a-71f4-aaa3-aac0981d519e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-640b-76c5-bdd4-6ff824e1399a', 'org_membership_defaults_pkey', 'p', '{019e8c61-641c-7d9c-88bf-56e367645cc3}'),
  ('019e8c61-6531-79fe-a0e7-89b05ac25d27', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6511-7bcf-9f20-33bcdcd3aae7', 'org_membership_settings_pkey', 'p', '{019e8c61-6523-78ba-99e0-93c0ded6995c}'),
  ('019e8c61-6727-7e4f-8c2e-7be6b56320f4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6707-7bc3-bd66-1f33bb4c29ff', 'org_members_pkey', 'p', '{019e8c61-6719-7fdb-ad5c-2917520e0a75}'),
  ('019e8c61-67ce-7b14-9e1e-d00b7d27ed3a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-67ac-7c35-888b-509bf3c4ed47', 'org_admin_grants_pkey', 'p', '{019e8c61-67bf-7d99-ab8d-81251eec9ccd}'),
  ('019e8c61-6880-70d5-9d90-c5816627c5a8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-685c-792b-8809-e7039d0ec228', 'org_owner_grants_pkey', 'p', '{019e8c61-6870-7de5-b776-cba8ac0e5b5a}'),
  ('019e8c61-692c-76ae-acfe-2dcdb2b3aa34', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-690a-70a9-8174-fca6ea09deab', 'org_member_profiles_pkey', 'p', '{019e8c61-691d-7aca-a9e9-163729891500}'),
  ('019e8c61-6a30-78ab-8980-134beeaed953', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6a0c-7af3-a0e8-8f1210dee00e', 'org_grants_pkey', 'p', '{019e8c61-6a1f-7cfb-980e-e2e1a957e5ab}'),
  ('019e8c61-6b54-735f-9dad-299510b36374', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6b2b-7d4e-bc96-61bac654e74d', 'org_profiles_pkey', 'p', '{019e8c61-6b43-77ea-9031-d359aa756023}'),
  ('019e8c61-6c69-7d5f-803d-12a8b53bcb07', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6c28-7345-b0e9-281835706d68', 'org_profile_permissions_pkey', 'p', '{019e8c61-6c3f-706c-8e8e-6c69c882dd5a}'),
  ('019e8c61-6d0b-705a-b5dc-329399fbf65b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6ce3-71b6-a7f0-67c83ff6f5b5', 'org_profile_grants_pkey', 'p', '{019e8c61-6cfa-7a94-b016-937c834ca53b}'),
  ('019e8c61-6dd7-7e5f-a864-0023b271aa5c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6daf-7ef0-9cfa-fc9ccb1d0d2a', 'org_profile_definition_grants_pkey', 'p', '{019e8c61-6dc8-7dcc-9def-e1b496ba3e56}'),
  ('019e8c61-6ed8-7cb4-aab5-b055016adbd0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6eb0-7cfc-b926-e3c23f2ff1a3', 'org_profile_templates_pkey', 'p', '{019e8c61-6ec9-718a-8f5c-1b1740237d60}'),
  ('019e8c61-7080-7429-aecc-3babd3b5dfc4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6f7e-7b17-80e6-ddace807cb67', 'org_events_pkey', 'p', '{019e8c61-6fac-715f-aa3c-00c9057c1acc,019e8c61-6f98-76c4-b161-7d8cd9dd77f3}'),
  ('019e8c61-70b9-758a-a21b-82d81b3af44b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7091-718e-ac95-1725d47ff3b8', 'org_event_aggregates_pkey', 'p', '{019e8c61-70a9-7758-93ca-9d51a390545d}'),
  ('019e8c61-7194-7400-917b-aa9e3373c458', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-716c-73c2-b358-28000c37fdc9', 'org_event_types_pkey', 'p', '{019e8c61-7183-7b76-af35-c6a00df0f892}'),
  ('019e8c61-72a2-76a2-805a-6d2f7e18655a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7274-7d04-b498-89d146b1467c', 'org_levels_pkey', 'p', '{019e8c61-7290-744a-8778-36a7e8a9debd}'),
  ('019e8c61-7376-7356-9055-fadc650c3790', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7348-70b8-89dc-676ca5c385c2', 'org_level_requirements_pkey', 'p', '{019e8c61-7361-76b3-b126-1e1114e73259}'),
  ('019e8c61-745f-7448-832e-2dbe6dffdcde', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7433-7839-96cb-13e23adcfe1d', 'org_level_grants_pkey', 'p', '{019e8c61-744e-7017-bbe0-b3cd1a0b2883}'),
  ('019e8c61-751d-7354-9be3-b111b31adfaa', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-74f3-711a-b865-71e639802fbe', 'org_achievement_rewards_pkey', 'p', '{019e8c61-750c-7501-a1c8-eeab5d403fc2}'),
  ('019e8c61-7b98-753d-8b83-61be861f9be6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', 'org_chart_edges_pkey', 'p', '{019e8c61-7b84-7fe1-81db-ca53dc25de9b}'),
  ('019e8c61-7cab-75b5-98e3-8387e905ee96', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7c4c-7ca8-b291-cca8a2d6b489', 'org_hierarchy_sprts_pkey', 'p', '{019e8c61-7c61-7ef9-889d-a449d86f6dbf,019e8c61-7c75-7a3a-bf5b-65f6025e2bef,019e8c61-7c86-7897-aab1-feb9485bc614}'),
  ('019e8c61-7cf9-7c02-86da-e4a8fc411b2f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7cce-7aa0-8687-c300d471037e', 'org_chart_edge_grants_pkey', 'p', '{019e8c61-7ce6-76f8-8aa2-4267b04b827d}'),
  ('019e8c61-7f27-713c-8619-a2636538c8ed', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7ec6-7a83-98aa-428b7ce62047', 'user_states_pkey', 'p', '{019e8c61-7edc-7e3e-9b20-3cd8368ed3d4}'),
  ('019e8c61-7fe8-7a1f-8a9d-322a06f9c26a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7fbb-7954-aa15-04256bba1ce7', 'sessions_pkey', 'p', '{019e8c61-7fd5-75bf-be39-abe4535829c4}'),
  ('019e8c61-8120-7ab2-807e-b3714a58ad65', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-80f9-7177-a2b7-a4f11931b9e7', 'session_credentials_pkey', 'p', '{019e8c61-810c-7d32-a4b3-aa20bc140014}'),
  ('019e8c61-8263-7f9e-a6e4-e0b087aa6ec3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8240-7e77-b23f-53ed7d296ab6', 'app_settings_auths_pkey', 'p', '{019e8c61-8252-71b4-9af2-c4bad5f4ad4a}'),
  ('019e8c61-87f0-7de1-aca7-49816f64be27', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-87c9-7b47-9e9a-03420e45641f', 'session_secrets_pkey', 'p', '{019e8c61-87dc-7428-809c-cd831fc2cd5a}'),
  ('019e8c61-88d8-7753-86af-cd3c3cc0e776', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-88ad-70b7-99ea-16e2c0e96651', 'app_settings_rate_limits_pkey', 'p', '{019e8c61-88be-7e9e-9fc4-4f78af814a3d}'),
  ('019e8c61-8a65-7cc7-a0f5-8609248e1d9e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8a3e-7402-bd69-608d4353836e', 'auth_ip_rate_limits_pkey', 'p', '{019e8c61-8a51-7992-9b46-d7a15f78202a}'),
  ('019e8c61-8b57-768f-9ebc-87e8ac45a0f1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8b2e-7907-9377-1e7220947ae7', 'auth_rate_limits_pkey', 'p', '{019e8c61-8b42-72a0-9887-b8fb080bb391}'),
  ('019e8c61-8cdd-79b0-9095-4ab163fb4875', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8cb0-74c5-9efd-666ced7f5792', 'app_namespaces_pkey', 'p', '{019e8c61-8cc8-73b3-8d5b-792a000b41c2}'),
  ('019e8c61-8f05-78ee-be8c-fa4da00a4bc1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8dd1-7ea4-b9c5-8758daeb1446', 'app_namespace_events_pkey', 'p', '{019e8c61-8e00-7ff7-9486-aebb3eefa1c8,019e8c61-8de7-78d4-b95c-b139d88c817c}'),
  ('019e8c61-90fe-7b68-9a3e-097b312db332', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-905b-754a-9ac3-7235f1eca9fc', 'user_secrets_pkey', 'p', '{019e8c61-9070-7a1a-8c20-e03c3e223bd1}'),
  ('019e8c61-932c-7f40-bd34-07a29b4c4705', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-91df-7216-a942-eecfef8d79d7', 'app_secrets_pkey', 'p', '{019e8c61-91f8-7aa8-a92b-a72102831e94}'),
  ('019e8c61-94d9-7157-b04a-b22dbac4c7fe', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-93c1-7e0a-a54f-444d8300cfa6', 'app_configs_pkey', 'p', '{019e8c61-93da-70b2-8054-8abc8737da69}'),
  ('019e8c61-9647-780d-b89b-d39fbae1ff08', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9531-7d66-8c4b-a8120d03a5a6', 'app_config_definitions_pkey', 'p', '{019e8c61-954b-7d94-8251-71450b0a6cc0}'),
  ('019e8c61-982b-7b15-a4e6-489c0d24f531', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-97f3-7e65-b577-738d989cde95', 'emails_pkey', 'p', '{019e8c61-980f-7b74-8135-54c999c6e2dc}'),
  ('019e8c61-9a79-707e-a5ea-68975e48b682', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9a34-748a-acf4-fb0ded800aa4', 'app_invites_pkey', 'p', '{019e8c61-9a60-7b30-b0f2-63d7cdd582d1}'),
  ('019e8c61-9c42-72b0-851d-fa333ce02c9b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9c07-7804-ad65-589cba79f737', 'app_claimed_invites_pkey', 'p', '{019e8c61-9c2a-7442-9234-87bf25a8242e}'),
  ('019e8c61-9dc9-710f-8bad-3e7a17665f4b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_pkey', 'p', '{019e8c61-9db0-7c7e-a1af-b82a86123cd0}'),
  ('019e8c61-a006-7749-8423-69dc74b0de21', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9fcc-7296-8afa-7b85b7ea7212', 'org_claimed_invites_pkey', 'p', '{019e8c61-9fee-7a39-9eaf-598bf81e8127}'),
  ('019e8c61-a35a-738b-95cb-d53803b5ed9e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a206-732d-a4ca-52ebc3829b4c', 'audit_log_auths_pkey', 'p', '{019e8c61-a2f7-70cb-babd-2dfd41824b70,019e8c61-a223-7878-8cf7-a0ac7add948a}');


SET session_replication_role TO DEFAULT;


