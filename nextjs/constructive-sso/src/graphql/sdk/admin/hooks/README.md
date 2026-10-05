# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useOrgGetManagersQuery` | Query | List all orgGetManagers |
| `useCreateOrgGetManagersRecordMutation` | Mutation | Create a orgGetManagersRecord |
| `useOrgGetSubordinatesQuery` | Query | List all orgGetSubordinates |
| `useCreateOrgGetSubordinatesRecordMutation` | Mutation | Create a orgGetSubordinatesRecord |
| `useMyPendingAppInvitesQuery` | Query | List all myPendingAppInvites |
| `useMyPendingAppInvitesRecordQuery` | Query | Get one myPendingAppInvitesRecord |
| `useCreateMyPendingAppInvitesRecordMutation` | Mutation | Create a myPendingAppInvitesRecord |
| `useUpdateMyPendingAppInvitesRecordMutation` | Mutation | Update a myPendingAppInvitesRecord |
| `useDeleteMyPendingAppInvitesRecordMutation` | Mutation | Delete a myPendingAppInvitesRecord |
| `useMyPendingOrgInvitesQuery` | Query | List all myPendingOrgInvites |
| `useMyPendingOrgInvitesRecordQuery` | Query | Get one myPendingOrgInvitesRecord |
| `useCreateMyPendingOrgInvitesRecordMutation` | Mutation | Create a myPendingOrgInvitesRecord |
| `useUpdateMyPendingOrgInvitesRecordMutation` | Mutation | Update a myPendingOrgInvitesRecord |
| `useDeleteMyPendingOrgInvitesRecordMutation` | Mutation | Delete a myPendingOrgInvitesRecord |
| `useAppCapabilitiesQuery` | Query | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useAppCapabilityQuery` | Query | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useCreateAppCapabilityMutation` | Mutation | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useUpdateAppCapabilityMutation` | Mutation | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useDeleteAppCapabilityMutation` | Mutation | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useAppCapabilityDefaultGrantsQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useAppCapabilityDefaultGrantQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useCreateAppCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useUpdateAppCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useDeleteAppCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useAppProfileCapabilitiesQuery` | Query | Join table linking profiles to individual capabilities they include |
| `useAppProfileCapabilityQuery` | Query | Join table linking profiles to individual capabilities they include |
| `useCreateAppProfileCapabilityMutation` | Mutation | Join table linking profiles to individual capabilities they include |
| `useUpdateAppProfileCapabilityMutation` | Mutation | Join table linking profiles to individual capabilities they include |
| `useDeleteAppProfileCapabilityMutation` | Mutation | Join table linking profiles to individual capabilities they include |
| `useAppMembershipsQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useAppMembershipQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useCreateAppMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useUpdateAppMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useDeleteAppMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useAppProfileGrantsQuery` | Query | Audit log of profile assignments and revocations for members |
| `useAppProfileGrantQuery` | Query | Audit log of profile assignments and revocations for members |
| `useCreateAppProfileGrantMutation` | Mutation | Audit log of profile assignments and revocations for members |
| `useUpdateAppProfileGrantMutation` | Mutation | Audit log of profile assignments and revocations for members |
| `useDeleteAppProfileGrantMutation` | Mutation | Audit log of profile assignments and revocations for members |
| `useAppMembershipProfilesQuery` | Query | Every profile a membership holds; memberships.profile_id points at one of them |
| `useAppMembershipProfileQuery` | Query | Every profile a membership holds; memberships.profile_id points at one of them |
| `useCreateAppMembershipProfileMutation` | Mutation | Every profile a membership holds; memberships.profile_id points at one of them |
| `useUpdateAppMembershipProfileMutation` | Mutation | Every profile a membership holds; memberships.profile_id points at one of them |
| `useDeleteAppMembershipProfileMutation` | Mutation | Every profile a membership holds; memberships.profile_id points at one of them |
| `useAppProfileDefinitionGrantsQuery` | Query | Audit log of capability additions and removals from profile definitions |
| `useAppProfileDefinitionGrantQuery` | Query | Audit log of capability additions and removals from profile definitions |
| `useCreateAppProfileDefinitionGrantMutation` | Mutation | Audit log of capability additions and removals from profile definitions |
| `useUpdateAppProfileDefinitionGrantMutation` | Mutation | Audit log of capability additions and removals from profile definitions |
| `useDeleteAppProfileDefinitionGrantMutation` | Mutation | Audit log of capability additions and removals from profile definitions |
| `useAppInvitesQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useAppInviteQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useCreateAppInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useUpdateAppInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useDeleteAppInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useOrgCapabilitiesQuery` | Query | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useOrgCapabilityQuery` | Query | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useCreateOrgCapabilityMutation` | Mutation | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useUpdateOrgCapabilityMutation` | Mutation | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useDeleteOrgCapabilityMutation` | Mutation | Defines available capabilities as named bits within a bitmask, used by the RBAC system for access control |
| `useOrgCapabilityDefaultCapabilitiesQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useOrgCapabilityDefaultCapabilityQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useCreateOrgCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useUpdateOrgCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useDeleteOrgCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useOrgCapabilityDefaultGrantsQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useOrgCapabilityDefaultGrantQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useCreateOrgCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useUpdateOrgCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useDeleteOrgCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useOrgProfileCapabilitiesQuery` | Query | Join table linking profiles to individual capabilities they include |
| `useOrgProfileCapabilityQuery` | Query | Join table linking profiles to individual capabilities they include |
| `useCreateOrgProfileCapabilityMutation` | Mutation | Join table linking profiles to individual capabilities they include |
| `useUpdateOrgProfileCapabilityMutation` | Mutation | Join table linking profiles to individual capabilities they include |
| `useDeleteOrgProfileCapabilityMutation` | Mutation | Join table linking profiles to individual capabilities they include |
| `useOrgMembershipsQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useOrgMembershipQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useCreateOrgMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useUpdateOrgMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useDeleteOrgMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useOrgProfileGrantsQuery` | Query | Audit log of profile assignments and revocations for members |
| `useOrgProfileGrantQuery` | Query | Audit log of profile assignments and revocations for members |
| `useCreateOrgProfileGrantMutation` | Mutation | Audit log of profile assignments and revocations for members |
| `useUpdateOrgProfileGrantMutation` | Mutation | Audit log of profile assignments and revocations for members |
| `useDeleteOrgProfileGrantMutation` | Mutation | Audit log of profile assignments and revocations for members |
| `useOrgMembershipProfilesQuery` | Query | Every profile a membership holds; memberships.profile_id points at one of them |
| `useOrgMembershipProfileQuery` | Query | Every profile a membership holds; memberships.profile_id points at one of them |
| `useCreateOrgMembershipProfileMutation` | Mutation | Every profile a membership holds; memberships.profile_id points at one of them |
| `useUpdateOrgMembershipProfileMutation` | Mutation | Every profile a membership holds; memberships.profile_id points at one of them |
| `useDeleteOrgMembershipProfileMutation` | Mutation | Every profile a membership holds; memberships.profile_id points at one of them |
| `useOrgProfileDefinitionGrantsQuery` | Query | Audit log of capability additions and removals from profile definitions |
| `useOrgProfileDefinitionGrantQuery` | Query | Audit log of capability additions and removals from profile definitions |
| `useCreateOrgProfileDefinitionGrantMutation` | Mutation | Audit log of capability additions and removals from profile definitions |
| `useUpdateOrgProfileDefinitionGrantMutation` | Mutation | Audit log of capability additions and removals from profile definitions |
| `useDeleteOrgProfileDefinitionGrantMutation` | Mutation | Audit log of capability additions and removals from profile definitions |
| `useOrgInvitesQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useOrgInviteQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useCreateOrgInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useUpdateOrgInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useDeleteOrgInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useOrgMembersQuery` | Query | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useOrgMemberQuery` | Query | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useCreateOrgMemberMutation` | Mutation | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useUpdateOrgMemberMutation` | Mutation | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useDeleteOrgMemberMutation` | Mutation | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useAppCapabilityDefaultsQuery` | Query | Stores the default capability bitmask assigned to new members upon joining |
| `useAppCapabilityDefaultQuery` | Query | Stores the default capability bitmask assigned to new members upon joining |
| `useCreateAppCapabilityDefaultMutation` | Mutation | Stores the default capability bitmask assigned to new members upon joining |
| `useUpdateAppCapabilityDefaultMutation` | Mutation | Stores the default capability bitmask assigned to new members upon joining |
| `useDeleteAppCapabilityDefaultMutation` | Mutation | Stores the default capability bitmask assigned to new members upon joining |
| `useOrgCapabilityDefaultsQuery` | Query | Stores the default capability bitmask assigned to new members upon joining |
| `useOrgCapabilityDefaultQuery` | Query | Stores the default capability bitmask assigned to new members upon joining |
| `useCreateOrgCapabilityDefaultMutation` | Mutation | Stores the default capability bitmask assigned to new members upon joining |
| `useUpdateOrgCapabilityDefaultMutation` | Mutation | Stores the default capability bitmask assigned to new members upon joining |
| `useDeleteOrgCapabilityDefaultMutation` | Mutation | Stores the default capability bitmask assigned to new members upon joining |
| `useAppCapabilityDefaultCapabilitiesQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useAppCapabilityDefaultCapabilityQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useCreateAppCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useUpdateAppCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useDeleteAppCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useAppAdminGrantsQuery` | Query | Records of admin role grants and revocations between members |
| `useAppAdminGrantQuery` | Query | Records of admin role grants and revocations between members |
| `useCreateAppAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useUpdateAppAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useDeleteAppAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useAppOwnerGrantsQuery` | Query | Records of ownership transfers and grants between members |
| `useAppOwnerGrantQuery` | Query | Records of ownership transfers and grants between members |
| `useCreateAppOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useUpdateAppOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useDeleteAppOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useOrgAdminGrantsQuery` | Query | Records of admin role grants and revocations between members |
| `useOrgAdminGrantQuery` | Query | Records of admin role grants and revocations between members |
| `useCreateOrgAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useUpdateOrgAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useDeleteOrgAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useOrgOwnerGrantsQuery` | Query | Records of ownership transfers and grants between members |
| `useOrgOwnerGrantQuery` | Query | Records of ownership transfers and grants between members |
| `useCreateOrgOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useUpdateOrgOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useDeleteOrgOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useOrgChartEdgeGrantsQuery` | Query | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useOrgChartEdgeGrantQuery` | Query | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useCreateOrgChartEdgeGrantMutation` | Mutation | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useUpdateOrgChartEdgeGrantMutation` | Mutation | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useDeleteOrgChartEdgeGrantMutation` | Mutation | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useAppClaimedInvitesQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useAppClaimedInviteQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useCreateAppClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useUpdateAppClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useDeleteAppClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useMembershipTypesQuery` | Query | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useMembershipTypeQuery` | Query | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useCreateMembershipTypeMutation` | Mutation | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useUpdateMembershipTypeMutation` | Mutation | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useDeleteMembershipTypeMutation` | Mutation | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useAppGrantsQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useAppGrantQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useCreateAppGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useUpdateAppGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useDeleteAppGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useOrgClaimedInvitesQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useOrgClaimedInviteQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useCreateOrgClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useUpdateOrgClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useDeleteOrgClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useOrgGrantsQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useOrgGrantQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useCreateOrgGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useUpdateOrgGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useDeleteOrgGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useOrgChartEdgesQuery` | Query | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useOrgChartEdgeQuery` | Query | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useCreateOrgChartEdgeMutation` | Mutation | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useUpdateOrgChartEdgeMutation` | Mutation | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useDeleteOrgChartEdgeMutation` | Mutation | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useAppProfileTemplatesQuery` | Query | Template profiles that are automatically seeded into new entities when created |
| `useAppProfileTemplateQuery` | Query | Template profiles that are automatically seeded into new entities when created |
| `useCreateAppProfileTemplateMutation` | Mutation | Template profiles that are automatically seeded into new entities when created |
| `useUpdateAppProfileTemplateMutation` | Mutation | Template profiles that are automatically seeded into new entities when created |
| `useDeleteAppProfileTemplateMutation` | Mutation | Template profiles that are automatically seeded into new entities when created |
| `useOrgProfileTemplatesQuery` | Query | Template profiles that are automatically seeded into new entities when created |
| `useOrgProfileTemplateQuery` | Query | Template profiles that are automatically seeded into new entities when created |
| `useCreateOrgProfileTemplateMutation` | Mutation | Template profiles that are automatically seeded into new entities when created |
| `useUpdateOrgProfileTemplateMutation` | Mutation | Template profiles that are automatically seeded into new entities when created |
| `useDeleteOrgProfileTemplateMutation` | Mutation | Template profiles that are automatically seeded into new entities when created |
| `useAppMembershipDefaultsQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useAppMembershipDefaultQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useCreateAppMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useUpdateAppMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useDeleteAppMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useOrgMembershipDefaultsQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useOrgMembershipDefaultQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useCreateOrgMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useUpdateOrgMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useDeleteOrgMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useAppProfilesQuery` | Query | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useAppProfileQuery` | Query | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useCreateAppProfileMutation` | Mutation | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useUpdateAppProfileMutation` | Mutation | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useDeleteAppProfileMutation` | Mutation | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useOrgProfilesQuery` | Query | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useOrgProfileQuery` | Query | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useCreateOrgProfileMutation` | Mutation | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useUpdateOrgProfileMutation` | Mutation | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useDeleteOrgProfileMutation` | Mutation | Named capability bundles (roles) that group multiple capabilities into reusable profiles |
| `useOrgMemberProfilesQuery` | Query | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useOrgMemberProfileQuery` | Query | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useCreateOrgMemberProfileMutation` | Mutation | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useUpdateOrgMemberProfileMutation` | Mutation | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useDeleteOrgMemberProfileMutation` | Mutation | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useOrgMembershipSettingsQuery` | Query | Per-entity settings for the memberships module |
| `useOrgMembershipSettingQuery` | Query | Per-entity settings for the memberships module |
| `useCreateOrgMembershipSettingMutation` | Mutation | Per-entity settings for the memberships module |
| `useUpdateOrgMembershipSettingMutation` | Mutation | Per-entity settings for the memberships module |
| `useDeleteOrgMembershipSettingMutation` | Mutation | Per-entity settings for the memberships module |
| `useAppCapabilitiesGetPaddedMaskQuery` | Query | appCapabilitiesGetPaddedMask |
| `useOrgCapabilitiesGetPaddedMaskQuery` | Query | orgCapabilitiesGetPaddedMask |
| `useOrgIsManagerOfQuery` | Query | orgIsManagerOf |
| `useAppCapabilitiesGetMaskQuery` | Query | appCapabilitiesGetMask |
| `useOrgCapabilitiesGetMaskQuery` | Query | orgCapabilitiesGetMask |
| `useGetOrganizationIdQuery` | Query | getOrganizationId |
| `useAppCapabilitiesGetMaskByNamesQuery` | Query | appCapabilitiesGetMaskByNames |
| `useOrgCapabilitiesGetMaskByNamesQuery` | Query | orgCapabilitiesGetMaskByNames |
| `useAppCapabilitiesGetByMaskQuery` | Query | Reads and enables pagination through a set of `AppCapability`. |
| `useOrgCapabilitiesGetByMaskQuery` | Query | Reads and enables pagination through a set of `OrgCapability`. |
| `useAcceptAppInviteMutation` | Mutation | acceptAppInvite |
| `useAcceptOrgInviteMutation` | Mutation | acceptOrgInvite |
| `useSubmitAppInviteCodeMutation` | Mutation | submitAppInviteCode |
| `useSubmitOrgInviteCodeMutation` | Mutation | submitOrgInviteCode |
| `useProvisionAppUserMutation` | Mutation | provisionAppUser |
| `useProvisionOrgUserMutation` | Mutation | provisionOrgUser |
| `useProvisionAppUsersBulkMutation` | Mutation | provisionAppUsersBulk |
| `useProvisionOrgUsersBulkMutation` | Mutation | provisionOrgUsersBulk |
| `useProvisionBucketMutation` | Mutation | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

## Table Hooks

### OrgGetManagersRecord

```typescript
// List all orgGetManagers
const { data, isLoading } = useOrgGetManagersQuery({
  selection: { fields: { userId: true, depth: true } },
});

// Create a orgGetManagersRecord
const { mutate: create } = useCreateOrgGetManagersRecordMutation({
  selection: { fields: { id: true } },
});
create({ userId: '<UUID>', depth: '<Int>' });
```

### OrgGetSubordinatesRecord

```typescript
// List all orgGetSubordinates
const { data, isLoading } = useOrgGetSubordinatesQuery({
  selection: { fields: { userId: true, depth: true } },
});

// Create a orgGetSubordinatesRecord
const { mutate: create } = useCreateOrgGetSubordinatesRecordMutation({
  selection: { fields: { id: true } },
});
create({ userId: '<UUID>', depth: '<Int>' });
```

### MyPendingAppInvitesRecord

```typescript
// List all myPendingAppInvites
const { data, isLoading } = useMyPendingAppInvitesQuery({
  selection: { fields: { id: true, senderId: true, channel: true, expiresAt: true, createdAt: true } },
});

// Get one myPendingAppInvitesRecord
const { data: item } = useMyPendingAppInvitesRecordQuery({
  id: '<UUID>',
  selection: { fields: { id: true, senderId: true, channel: true, expiresAt: true, createdAt: true } },
});

// Create a myPendingAppInvitesRecord
const { mutate: create } = useCreateMyPendingAppInvitesRecordMutation({
  selection: { fields: { id: true } },
});
create({ senderId: '<UUID>', channel: '<String>', expiresAt: '<Datetime>' });
```

### MyPendingOrgInvitesRecord

```typescript
// List all myPendingOrgInvites
const { data, isLoading } = useMyPendingOrgInvitesQuery({
  selection: { fields: { id: true, entityId: true, senderId: true, channel: true, expiresAt: true, createdAt: true } },
});

// Get one myPendingOrgInvitesRecord
const { data: item } = useMyPendingOrgInvitesRecordQuery({
  id: '<UUID>',
  selection: { fields: { id: true, entityId: true, senderId: true, channel: true, expiresAt: true, createdAt: true } },
});

// Create a myPendingOrgInvitesRecord
const { mutate: create } = useCreateMyPendingOrgInvitesRecordMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', senderId: '<UUID>', channel: '<String>', expiresAt: '<Datetime>' });
```

### AppCapability

```typescript
// List all appCapabilities
const { data, isLoading } = useAppCapabilitiesQuery({
  selection: { fields: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } },
});

// Get one appCapability
const { data: item } = useAppCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } },
});

// Create a appCapability
const { mutate: create } = useCreateAppCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', bitnum: '<Int>', bitstr: '<BitString>', description: '<String>', kind: '<String>' });
```

### AppCapabilityDefaultGrant

```typescript
// List all appCapabilityDefaultGrants
const { data, isLoading } = useAppCapabilityDefaultGrantsQuery({
  selection: { fields: { id: true, capabilityId: true, isGrant: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one appCapabilityDefaultGrant
const { data: item } = useAppCapabilityDefaultGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilityId: true, isGrant: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a appCapabilityDefaultGrant
const { mutate: create } = useCreateAppCapabilityDefaultGrantMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>', isGrant: '<Boolean>', grantorId: '<UUID>' });
```

### AppProfileCapability

```typescript
// List all appProfileCapabilities
const { data, isLoading } = useAppProfileCapabilitiesQuery({
  selection: { fields: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } },
});

// Get one appProfileCapability
const { data: item } = useAppProfileCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } },
});

// Create a appProfileCapability
const { mutate: create } = useCreateAppProfileCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ profileId: '<UUID>', capabilityId: '<UUID>' });
```

### AppMembership

```typescript
// List all appMemberships
const { data, isLoading } = useAppMembershipsQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isVerified: true, isActive: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, profileId: true } },
});

// Get one appMembership
const { data: item } = useAppMembershipQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isVerified: true, isActive: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, profileId: true } },
});

// Create a appMembership
const { mutate: create } = useCreateAppMembershipMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isVerified: '<Boolean>', isActive: '<Boolean>', isOwner: '<Boolean>', isAdmin: '<Boolean>', capabilities: '<BitString>', granted: '<BitString>', actorId: '<UUID>', profileId: '<UUID>' });
```

### AppProfileGrant

```typescript
// List all appProfileGrants
const { data, isLoading } = useAppProfileGrantsQuery({
  selection: { fields: { id: true, membershipId: true, profileId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Get one appProfileGrant
const { data: item } = useAppProfileGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, membershipId: true, profileId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Create a appProfileGrant
const { mutate: create } = useCreateAppProfileGrantMutation({
  selection: { fields: { id: true } },
});
create({ membershipId: '<UUID>', profileId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### AppMembershipProfile

```typescript
// List all appMembershipProfiles
const { data, isLoading } = useAppMembershipProfilesQuery({
  selection: { fields: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } },
});

// Get one appMembershipProfile
const { data: item } = useAppMembershipProfileQuery({
  id: '<UUID>',
  selection: { fields: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } },
});

// Create a appMembershipProfile
const { mutate: create } = useCreateAppMembershipProfileMutation({
  selection: { fields: { id: true } },
});
create({ membershipId: '<UUID>', profileId: '<UUID>', actorId: '<UUID>' });
```

### AppProfileDefinitionGrant

```typescript
// List all appProfileDefinitionGrants
const { data, isLoading } = useAppProfileDefinitionGrantsQuery({
  selection: { fields: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Get one appProfileDefinitionGrant
const { data: item } = useAppProfileDefinitionGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Create a appProfileDefinitionGrant
const { mutate: create } = useCreateAppProfileDefinitionGrantMutation({
  selection: { fields: { id: true } },
});
create({ profileId: '<UUID>', capabilityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### AppInvite

```typescript
// List all appInvites
const { data, isLoading } = useAppInvitesQuery({
  selection: { fields: { id: true, channel: true, email: true, phone: true, senderId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, expiresAt: true, createdAt: true, updatedAt: true } },
});

// Get one appInvite
const { data: item } = useAppInviteQuery({
  id: '<UUID>',
  selection: { fields: { id: true, channel: true, email: true, phone: true, senderId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, expiresAt: true, createdAt: true, updatedAt: true } },
});

// Create a appInvite
const { mutate: create } = useCreateAppInviteMutation({
  selection: { fields: { id: true } },
});
create({ channel: '<String>', email: '<Email>', phone: '<String>', senderId: '<UUID>', inviteToken: '<String>', inviteValid: '<Boolean>', inviteLimit: '<Int>', inviteCount: '<Int>', multiple: '<Boolean>', data: '<JSON>', profileId: '<UUID>', expiresAt: '<Datetime>' });
```

### OrgCapability

```typescript
// List all orgCapabilities
const { data, isLoading } = useOrgCapabilitiesQuery({
  selection: { fields: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } },
});

// Get one orgCapability
const { data: item } = useOrgCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } },
});

// Create a orgCapability
const { mutate: create } = useCreateOrgCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', bitnum: '<Int>', bitstr: '<BitString>', description: '<String>', kind: '<String>' });
```

### OrgCapabilityDefaultCapability

```typescript
// List all orgCapabilityDefaultCapabilities
const { data, isLoading } = useOrgCapabilityDefaultCapabilitiesQuery({
  selection: { fields: { id: true, capabilityId: true, entityId: true, createdAt: true, updatedAt: true } },
});

// Get one orgCapabilityDefaultCapability
const { data: item } = useOrgCapabilityDefaultCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilityId: true, entityId: true, createdAt: true, updatedAt: true } },
});

// Create a orgCapabilityDefaultCapability
const { mutate: create } = useCreateOrgCapabilityDefaultCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>', entityId: '<UUID>' });
```

### OrgCapabilityDefaultGrant

```typescript
// List all orgCapabilityDefaultGrants
const { data, isLoading } = useOrgCapabilityDefaultGrantsQuery({
  selection: { fields: { id: true, capabilityId: true, isGrant: true, grantorId: true, entityId: true, createdAt: true, updatedAt: true } },
});

// Get one orgCapabilityDefaultGrant
const { data: item } = useOrgCapabilityDefaultGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilityId: true, isGrant: true, grantorId: true, entityId: true, createdAt: true, updatedAt: true } },
});

// Create a orgCapabilityDefaultGrant
const { mutate: create } = useCreateOrgCapabilityDefaultGrantMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>', isGrant: '<Boolean>', grantorId: '<UUID>', entityId: '<UUID>' });
```

### OrgProfileCapability

```typescript
// List all orgProfileCapabilities
const { data, isLoading } = useOrgProfileCapabilitiesQuery({
  selection: { fields: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } },
});

// Get one orgProfileCapability
const { data: item } = useOrgProfileCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } },
});

// Create a orgProfileCapability
const { mutate: create } = useCreateOrgProfileCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ profileId: '<UUID>', capabilityId: '<UUID>' });
```

### OrgMembership

```typescript
// List all orgMemberships
const { data, isLoading } = useOrgMembershipsQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isActive: true, isExternal: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, entityId: true, isReadOnly: true, profileId: true } },
});

// Get one orgMembership
const { data: item } = useOrgMembershipQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isActive: true, isExternal: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, entityId: true, isReadOnly: true, profileId: true } },
});

// Create a orgMembership
const { mutate: create } = useCreateOrgMembershipMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isActive: '<Boolean>', isExternal: '<Boolean>', isOwner: '<Boolean>', isAdmin: '<Boolean>', capabilities: '<BitString>', granted: '<BitString>', actorId: '<UUID>', entityId: '<UUID>', isReadOnly: '<Boolean>', profileId: '<UUID>' });
```

### OrgProfileGrant

```typescript
// List all orgProfileGrants
const { data, isLoading } = useOrgProfileGrantsQuery({
  selection: { fields: { id: true, membershipId: true, profileId: true, entityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Get one orgProfileGrant
const { data: item } = useOrgProfileGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, membershipId: true, profileId: true, entityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Create a orgProfileGrant
const { mutate: create } = useCreateOrgProfileGrantMutation({
  selection: { fields: { id: true } },
});
create({ membershipId: '<UUID>', profileId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### OrgMembershipProfile

```typescript
// List all orgMembershipProfiles
const { data, isLoading } = useOrgMembershipProfilesQuery({
  selection: { fields: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } },
});

// Get one orgMembershipProfile
const { data: item } = useOrgMembershipProfileQuery({
  id: '<UUID>',
  selection: { fields: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } },
});

// Create a orgMembershipProfile
const { mutate: create } = useCreateOrgMembershipProfileMutation({
  selection: { fields: { id: true } },
});
create({ membershipId: '<UUID>', profileId: '<UUID>', actorId: '<UUID>' });
```

### OrgProfileDefinitionGrant

```typescript
// List all orgProfileDefinitionGrants
const { data, isLoading } = useOrgProfileDefinitionGrantsQuery({
  selection: { fields: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Get one orgProfileDefinitionGrant
const { data: item } = useOrgProfileDefinitionGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } },
});

// Create a orgProfileDefinitionGrant
const { mutate: create } = useCreateOrgProfileDefinitionGrantMutation({
  selection: { fields: { id: true } },
});
create({ profileId: '<UUID>', capabilityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### OrgInvite

```typescript
// List all orgInvites
const { data, isLoading } = useOrgInvitesQuery({
  selection: { fields: { id: true, channel: true, email: true, phone: true, senderId: true, receiverId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, isReadOnly: true, expiresAt: true, createdAt: true, updatedAt: true, entityId: true } },
});

// Get one orgInvite
const { data: item } = useOrgInviteQuery({
  id: '<UUID>',
  selection: { fields: { id: true, channel: true, email: true, phone: true, senderId: true, receiverId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, isReadOnly: true, expiresAt: true, createdAt: true, updatedAt: true, entityId: true } },
});

// Create a orgInvite
const { mutate: create } = useCreateOrgInviteMutation({
  selection: { fields: { id: true } },
});
create({ channel: '<String>', email: '<Email>', phone: '<String>', senderId: '<UUID>', receiverId: '<UUID>', inviteToken: '<String>', inviteValid: '<Boolean>', inviteLimit: '<Int>', inviteCount: '<Int>', multiple: '<Boolean>', data: '<JSON>', profileId: '<UUID>', isReadOnly: '<Boolean>', expiresAt: '<Datetime>', entityId: '<UUID>' });
```

### OrgMember

```typescript
// List all orgMembers
const { data, isLoading } = useOrgMembersQuery({
  selection: { fields: { id: true, isAdmin: true, actorId: true, entityId: true } },
});

// Get one orgMember
const { data: item } = useOrgMemberQuery({
  id: '<UUID>',
  selection: { fields: { id: true, isAdmin: true, actorId: true, entityId: true } },
});

// Create a orgMember
const { mutate: create } = useCreateOrgMemberMutation({
  selection: { fields: { id: true } },
});
create({ isAdmin: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>' });
```

### AppCapabilityDefault

```typescript
// List all appCapabilityDefaults
const { data, isLoading } = useAppCapabilityDefaultsQuery({
  selection: { fields: { id: true, capabilities: true } },
});

// Get one appCapabilityDefault
const { data: item } = useAppCapabilityDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilities: true } },
});

// Create a appCapabilityDefault
const { mutate: create } = useCreateAppCapabilityDefaultMutation({
  selection: { fields: { id: true } },
});
create({ capabilities: '<BitString>' });
```

### OrgCapabilityDefault

```typescript
// List all orgCapabilityDefaults
const { data, isLoading } = useOrgCapabilityDefaultsQuery({
  selection: { fields: { id: true, capabilities: true, entityId: true } },
});

// Get one orgCapabilityDefault
const { data: item } = useOrgCapabilityDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilities: true, entityId: true } },
});

// Create a orgCapabilityDefault
const { mutate: create } = useCreateOrgCapabilityDefaultMutation({
  selection: { fields: { id: true } },
});
create({ capabilities: '<BitString>', entityId: '<UUID>' });
```

### AppCapabilityDefaultCapability

```typescript
// List all appCapabilityDefaultCapabilities
const { data, isLoading } = useAppCapabilityDefaultCapabilitiesQuery({
  selection: { fields: { id: true, capabilityId: true, createdAt: true, updatedAt: true } },
});

// Get one appCapabilityDefaultCapability
const { data: item } = useAppCapabilityDefaultCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilityId: true, createdAt: true, updatedAt: true } },
});

// Create a appCapabilityDefaultCapability
const { mutate: create } = useCreateAppCapabilityDefaultCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>' });
```

### AppAdminGrant

```typescript
// List all appAdminGrants
const { data, isLoading } = useAppAdminGrantsQuery({
  selection: { fields: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one appAdminGrant
const { data: item } = useAppAdminGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a appAdminGrant
const { mutate: create } = useCreateAppAdminGrantMutation({
  selection: { fields: { id: true } },
});
create({ isGrant: '<Boolean>', actorId: '<UUID>', grantorId: '<UUID>' });
```

### AppOwnerGrant

```typescript
// List all appOwnerGrants
const { data, isLoading } = useAppOwnerGrantsQuery({
  selection: { fields: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one appOwnerGrant
const { data: item } = useAppOwnerGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a appOwnerGrant
const { mutate: create } = useCreateAppOwnerGrantMutation({
  selection: { fields: { id: true } },
});
create({ isGrant: '<Boolean>', actorId: '<UUID>', grantorId: '<UUID>' });
```

### OrgAdminGrant

```typescript
// List all orgAdminGrants
const { data, isLoading } = useOrgAdminGrantsQuery({
  selection: { fields: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one orgAdminGrant
const { data: item } = useOrgAdminGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a orgAdminGrant
const { mutate: create } = useCreateOrgAdminGrantMutation({
  selection: { fields: { id: true } },
});
create({ isGrant: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>' });
```

### OrgOwnerGrant

```typescript
// List all orgOwnerGrants
const { data, isLoading } = useOrgOwnerGrantsQuery({
  selection: { fields: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one orgOwnerGrant
const { data: item } = useOrgOwnerGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a orgOwnerGrant
const { mutate: create } = useCreateOrgOwnerGrantMutation({
  selection: { fields: { id: true } },
});
create({ isGrant: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>' });
```

### OrgChartEdgeGrant

```typescript
// List all orgChartEdgeGrants
const { data, isLoading } = useOrgChartEdgeGrantsQuery({
  selection: { fields: { id: true, entityId: true, childId: true, parentId: true, grantorId: true, isGrant: true, positionTitle: true, positionLevel: true, createdAt: true } },
});

// Get one orgChartEdgeGrant
const { data: item } = useOrgChartEdgeGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, entityId: true, childId: true, parentId: true, grantorId: true, isGrant: true, positionTitle: true, positionLevel: true, createdAt: true } },
});

// Create a orgChartEdgeGrant
const { mutate: create } = useCreateOrgChartEdgeGrantMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', childId: '<UUID>', parentId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>', positionTitle: '<String>', positionLevel: '<Int>' });
```

### AppClaimedInvite

```typescript
// List all appClaimedInvites
const { data, isLoading } = useAppClaimedInvitesQuery({
  selection: { fields: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true } },
});

// Get one appClaimedInvite
const { data: item } = useAppClaimedInviteQuery({
  id: '<UUID>',
  selection: { fields: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true } },
});

// Create a appClaimedInvite
const { mutate: create } = useCreateAppClaimedInviteMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', senderId: '<UUID>', receiverId: '<UUID>' });
```

### MembershipType

```typescript
// List all membershipTypes
const { data, isLoading } = useMembershipTypesQuery({
  selection: { fields: { id: true, name: true, description: true, scope: true, parentMembershipType: true, hasUsersTableEntry: true } },
});

// Get one membershipType
const { data: item } = useMembershipTypeQuery({
  id: '<Int>',
  selection: { fields: { id: true, name: true, description: true, scope: true, parentMembershipType: true, hasUsersTableEntry: true } },
});

// Create a membershipType
const { mutate: create } = useCreateMembershipTypeMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', description: '<String>', scope: '<String>', parentMembershipType: '<Int>', hasUsersTableEntry: '<Boolean>' });
```

### AppGrant

```typescript
// List all appGrants
const { data, isLoading } = useAppGrantsQuery({
  selection: { fields: { id: true, capabilities: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one appGrant
const { data: item } = useAppGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilities: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a appGrant
const { mutate: create } = useCreateAppGrantMutation({
  selection: { fields: { id: true } },
});
create({ capabilities: '<BitString>', isGrant: '<Boolean>', actorId: '<UUID>', grantorId: '<UUID>' });
```

### OrgClaimedInvite

```typescript
// List all orgClaimedInvites
const { data, isLoading } = useOrgClaimedInvitesQuery({
  selection: { fields: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true, entityId: true } },
});

// Get one orgClaimedInvite
const { data: item } = useOrgClaimedInviteQuery({
  id: '<UUID>',
  selection: { fields: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true, entityId: true } },
});

// Create a orgClaimedInvite
const { mutate: create } = useCreateOrgClaimedInviteMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', senderId: '<UUID>', receiverId: '<UUID>', entityId: '<UUID>' });
```

### OrgGrant

```typescript
// List all orgGrants
const { data, isLoading } = useOrgGrantsQuery({
  selection: { fields: { id: true, capabilities: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Get one orgGrant
const { data: item } = useOrgGrantQuery({
  id: '<UUID>',
  selection: { fields: { id: true, capabilities: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } },
});

// Create a orgGrant
const { mutate: create } = useCreateOrgGrantMutation({
  selection: { fields: { id: true } },
});
create({ capabilities: '<BitString>', isGrant: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>' });
```

### OrgChartEdge

```typescript
// List all orgChartEdges
const { data, isLoading } = useOrgChartEdgesQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, entityId: true, childId: true, parentId: true, positionTitle: true, positionLevel: true } },
});

// Get one orgChartEdge
const { data: item } = useOrgChartEdgeQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, entityId: true, childId: true, parentId: true, positionTitle: true, positionLevel: true } },
});

// Create a orgChartEdge
const { mutate: create } = useCreateOrgChartEdgeMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', childId: '<UUID>', parentId: '<UUID>', positionTitle: '<String>', positionLevel: '<Int>' });
```

### AppProfileTemplate

```typescript
// List all appProfileTemplates
const { data, isLoading } = useAppProfileTemplatesQuery({
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } },
});

// Get one appProfileTemplate
const { data: item } = useAppProfileTemplateQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } },
});

// Create a appProfileTemplate
const { mutate: create } = useCreateAppProfileTemplateMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isDefault: '<Boolean>' });
```

### OrgProfileTemplate

```typescript
// List all orgProfileTemplates
const { data, isLoading } = useOrgProfileTemplatesQuery({
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } },
});

// Get one orgProfileTemplate
const { data: item } = useOrgProfileTemplateQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } },
});

// Create a orgProfileTemplate
const { mutate: create } = useCreateOrgProfileTemplateMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isDefault: '<Boolean>' });
```

### AppMembershipDefault

```typescript
// List all appMembershipDefaults
const { data, isLoading } = useAppMembershipDefaultsQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isVerified: true } },
});

// Get one appMembershipDefault
const { data: item } = useAppMembershipDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isVerified: true } },
});

// Create a appMembershipDefault
const { mutate: create } = useCreateAppMembershipDefaultMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', isVerified: '<Boolean>' });
```

### OrgMembershipDefault

```typescript
// List all orgMembershipDefaults
const { data, isLoading } = useOrgMembershipDefaultsQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, entityId: true } },
});

// Get one orgMembershipDefault
const { data: item } = useOrgMembershipDefaultQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, entityId: true } },
});

// Create a orgMembershipDefault
const { mutate: create } = useCreateOrgMembershipDefaultMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', entityId: '<UUID>' });
```

### AppProfile

```typescript
// List all appProfiles
const { data, isLoading } = useAppProfilesQuery({
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true } },
});

// Get one appProfile
const { data: item } = useAppProfileQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true } },
});

// Create a appProfile
const { mutate: create } = useCreateAppProfileMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isSystem: '<Boolean>', isDefault: '<Boolean>' });
```

### OrgProfile

```typescript
// List all orgProfiles
const { data, isLoading } = useOrgProfilesQuery({
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true, entityId: true } },
});

// Get one orgProfile
const { data: item } = useOrgProfileQuery({
  id: '<UUID>',
  selection: { fields: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true, entityId: true } },
});

// Create a orgProfile
const { mutate: create } = useCreateOrgProfileMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isSystem: '<Boolean>', isDefault: '<Boolean>', entityId: '<UUID>' });
```

### OrgMemberProfile

```typescript
// List all orgMemberProfiles
const { data, isLoading } = useOrgMemberProfilesQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, membershipId: true, entityId: true, actorId: true, displayName: true, email: true, title: true, bio: true, profilePicture: true } },
});

// Get one orgMemberProfile
const { data: item } = useOrgMemberProfileQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, membershipId: true, entityId: true, actorId: true, displayName: true, email: true, title: true, bio: true, profilePicture: true } },
});

// Create a orgMemberProfile
const { mutate: create } = useCreateOrgMemberProfileMutation({
  selection: { fields: { id: true } },
});
create({ membershipId: '<UUID>', entityId: '<UUID>', actorId: '<UUID>', displayName: '<String>', email: '<String>', title: '<String>', bio: '<String>', profilePicture: '<Image>' });
```

### OrgMembershipSetting

```typescript
// List all orgMembershipSettings
const { data, isLoading } = useOrgMembershipSettingsQuery({
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, entityId: true, deleteMemberCascadeChildren: true, createChildCascadeOwners: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, inviteProfileAssignmentMode: true, populateMemberEmail: true, limitAllocationMode: true } },
});

// Get one orgMembershipSetting
const { data: item } = useOrgMembershipSettingQuery({
  id: '<UUID>',
  selection: { fields: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, entityId: true, deleteMemberCascadeChildren: true, createChildCascadeOwners: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, inviteProfileAssignmentMode: true, populateMemberEmail: true, limitAllocationMode: true } },
});

// Create a orgMembershipSetting
const { mutate: create } = useCreateOrgMembershipSettingMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', entityId: '<UUID>', deleteMemberCascadeChildren: '<Boolean>', createChildCascadeOwners: '<Boolean>', createChildCascadeAdmins: '<Boolean>', createChildCascadeMembers: '<Boolean>', allowExternalMembers: '<Boolean>', allowPrincipalOwnedApiKeys: '<Boolean>', apiKeyMaxDuration: '<Interval>', inviteProfileAssignmentMode: '<String>', populateMemberEmail: '<Boolean>', limitAllocationMode: '<String>' });
```

## Custom Operation Hooks

### `useAppCapabilitiesGetPaddedMaskQuery`

appCapabilitiesGetPaddedMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |

### `useOrgCapabilitiesGetPaddedMaskQuery`

orgCapabilitiesGetPaddedMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |

### `useOrgIsManagerOfQuery`

orgIsManagerOf

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `targetEntityId` | UUID |
  | `managerId` | UUID |
  | `userId` | UUID |
  | `maxDepth` | Int |

### `useAppCapabilitiesGetMaskQuery`

appCapabilitiesGetMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `ids` | [UUID] |

### `useOrgCapabilitiesGetMaskQuery`

orgCapabilitiesGetMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `ids` | [UUID] |

### `useGetOrganizationIdQuery`

getOrganizationId

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `entityType` | String |
  | `entityId` | UUID |

### `useAppCapabilitiesGetMaskByNamesQuery`

appCapabilitiesGetMaskByNames

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `names` | [String] |

### `useOrgCapabilitiesGetMaskByNamesQuery`

orgCapabilitiesGetMaskByNames

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `names` | [String] |

### `useAppCapabilitiesGetByMaskQuery`

Reads and enables pagination through a set of `AppCapability`.

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |
  | `first` | Int |
  | `offset` | Int |
  | `after` | Cursor |

### `useOrgCapabilitiesGetByMaskQuery`

Reads and enables pagination through a set of `OrgCapability`.

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |
  | `first` | Int |
  | `offset` | Int |
  | `after` | Cursor |

### `useAcceptAppInviteMutation`

acceptAppInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptAppInviteInput (required) |

### `useAcceptOrgInviteMutation`

acceptOrgInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptOrgInviteInput (required) |

### `useSubmitAppInviteCodeMutation`

submitAppInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitAppInviteCodeInput (required) |

### `useSubmitOrgInviteCodeMutation`

submitOrgInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitOrgInviteCodeInput (required) |

### `useProvisionAppUserMutation`

provisionAppUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUserInput (required) |

### `useProvisionOrgUserMutation`

provisionOrgUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUserInput (required) |

### `useProvisionAppUsersBulkMutation`

provisionAppUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUsersBulkInput (required) |

### `useProvisionOrgUsersBulkMutation`

provisionOrgUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUsersBulkInput (required) |

### `useProvisionBucketMutation`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

---

Built by the [Constructive](https://constructive.io) team.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
