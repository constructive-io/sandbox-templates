# ORM Client

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { createClient } from './orm';

const db = createClient({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});
```

## Models

| Model | Operations |
|-------|------------|
| `orgGetManagersRecord` | findMany, findOne, create, update, delete |
| `orgGetSubordinatesRecord` | findMany, findOne, create, update, delete |
| `myPendingAppInvitesRecord` | findMany, findOne, create, update, delete |
| `myPendingOrgInvitesRecord` | findMany, findOne, create, update, delete |
| `appCapability` | findMany, findOne, create, update, delete |
| `appCapabilityDefaultGrant` | findMany, findOne, create, update, delete |
| `appProfileCapability` | findMany, findOne, create, update, delete |
| `appMembership` | findMany, findOne, create, update, delete |
| `appProfileGrant` | findMany, findOne, create, update, delete |
| `appMembershipProfile` | findMany, findOne, create, update, delete |
| `appProfileDefinitionGrant` | findMany, findOne, create, update, delete |
| `appInvite` | findMany, findOne, create, update, delete |
| `orgCapability` | findMany, findOne, create, update, delete |
| `orgCapabilityDefaultCapability` | findMany, findOne, create, update, delete |
| `orgCapabilityDefaultGrant` | findMany, findOne, create, update, delete |
| `orgProfileCapability` | findMany, findOne, create, update, delete |
| `orgMembership` | findMany, findOne, create, update, delete |
| `orgProfileGrant` | findMany, findOne, create, update, delete |
| `orgMembershipProfile` | findMany, findOne, create, update, delete |
| `orgProfileDefinitionGrant` | findMany, findOne, create, update, delete |
| `orgInvite` | findMany, findOne, create, update, delete |
| `orgMember` | findMany, findOne, create, update, delete |
| `appCapabilityDefault` | findMany, findOne, create, update, delete |
| `orgCapabilityDefault` | findMany, findOne, create, update, delete |
| `appCapabilityDefaultCapability` | findMany, findOne, create, update, delete |
| `appAdminGrant` | findMany, findOne, create, update, delete |
| `appOwnerGrant` | findMany, findOne, create, update, delete |
| `orgAdminGrant` | findMany, findOne, create, update, delete |
| `orgOwnerGrant` | findMany, findOne, create, update, delete |
| `orgChartEdgeGrant` | findMany, findOne, create, update, delete |
| `appClaimedInvite` | findMany, findOne, create, update, delete |
| `membershipType` | findMany, findOne, create, update, delete |
| `appGrant` | findMany, findOne, create, update, delete |
| `orgClaimedInvite` | findMany, findOne, create, update, delete |
| `orgGrant` | findMany, findOne, create, update, delete |
| `orgChartEdge` | findMany, findOne, create, update, delete |
| `appProfileTemplate` | findMany, findOne, create, update, delete |
| `orgProfileTemplate` | findMany, findOne, create, update, delete |
| `appMembershipDefault` | findMany, findOne, create, update, delete |
| `orgMembershipDefault` | findMany, findOne, create, update, delete |
| `appProfile` | findMany, findOne, create, update, delete |
| `orgProfile` | findMany, findOne, create, update, delete |
| `orgMemberProfile` | findMany, findOne, create, update, delete |
| `orgMembershipSetting` | findMany, findOne, create, update, delete |

## Table Operations

### `db.orgGetManagersRecord`

CRUD operations for OrgGetManagersRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `userId` | UUID | Yes |
| `depth` | Int | Yes |

**Operations:**

```typescript
// List all orgGetManagersRecord records
const items = await db.orgGetManagersRecord.findMany({ select: { userId: true, depth: true } }).execute();

// Get one by id
const item = await db.orgGetManagersRecord.findOne({ id: '<UUID>', select: { userId: true, depth: true } }).execute();

// Create
const created = await db.orgGetManagersRecord.create({ data: { userId: '<UUID>', depth: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgGetManagersRecord.update({ where: { id: '<UUID>' }, data: { userId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgGetManagersRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgGetSubordinatesRecord`

CRUD operations for OrgGetSubordinatesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `userId` | UUID | Yes |
| `depth` | Int | Yes |

**Operations:**

```typescript
// List all orgGetSubordinatesRecord records
const items = await db.orgGetSubordinatesRecord.findMany({ select: { userId: true, depth: true } }).execute();

// Get one by id
const item = await db.orgGetSubordinatesRecord.findOne({ id: '<UUID>', select: { userId: true, depth: true } }).execute();

// Create
const created = await db.orgGetSubordinatesRecord.create({ data: { userId: '<UUID>', depth: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgGetSubordinatesRecord.update({ where: { id: '<UUID>' }, data: { userId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgGetSubordinatesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.myPendingAppInvitesRecord`

CRUD operations for MyPendingAppInvitesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `senderId` | UUID | Yes |
| `channel` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `createdAt` | Datetime | No |

**Operations:**

```typescript
// List all myPendingAppInvitesRecord records
const items = await db.myPendingAppInvitesRecord.findMany({ select: { id: true, senderId: true, channel: true, expiresAt: true, createdAt: true } }).execute();

// Get one by id
const item = await db.myPendingAppInvitesRecord.findOne({ id: '<UUID>', select: { id: true, senderId: true, channel: true, expiresAt: true, createdAt: true } }).execute();

// Create
const created = await db.myPendingAppInvitesRecord.create({ data: { senderId: '<UUID>', channel: '<String>', expiresAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.myPendingAppInvitesRecord.update({ where: { id: '<UUID>' }, data: { senderId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.myPendingAppInvitesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.myPendingOrgInvitesRecord`

CRUD operations for MyPendingOrgInvitesRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `entityId` | UUID | Yes |
| `senderId` | UUID | Yes |
| `channel` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `createdAt` | Datetime | No |

**Operations:**

```typescript
// List all myPendingOrgInvitesRecord records
const items = await db.myPendingOrgInvitesRecord.findMany({ select: { id: true, entityId: true, senderId: true, channel: true, expiresAt: true, createdAt: true } }).execute();

// Get one by id
const item = await db.myPendingOrgInvitesRecord.findOne({ id: '<UUID>', select: { id: true, entityId: true, senderId: true, channel: true, expiresAt: true, createdAt: true } }).execute();

// Create
const created = await db.myPendingOrgInvitesRecord.create({ data: { entityId: '<UUID>', senderId: '<UUID>', channel: '<String>', expiresAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.myPendingOrgInvitesRecord.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.myPendingOrgInvitesRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appCapability`

CRUD operations for AppCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `bitnum` | Int | Yes |
| `bitstr` | BitString | Yes |
| `description` | String | Yes |
| `kind` | String | Yes |

**Operations:**

```typescript
// List all appCapability records
const items = await db.appCapability.findMany({ select: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } }).execute();

// Get one by id
const item = await db.appCapability.findOne({ id: '<UUID>', select: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } }).execute();

// Create
const created = await db.appCapability.create({ data: { name: '<String>', bitnum: '<Int>', bitstr: '<BitString>', description: '<String>', kind: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.appCapability.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appCapabilityDefaultGrant`

CRUD operations for AppCapabilityDefaultGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilityId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appCapabilityDefaultGrant records
const items = await db.appCapabilityDefaultGrant.findMany({ select: { id: true, capabilityId: true, isGrant: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appCapabilityDefaultGrant.findOne({ id: '<UUID>', select: { id: true, capabilityId: true, isGrant: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appCapabilityDefaultGrant.create({ data: { capabilityId: '<UUID>', isGrant: '<Boolean>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appCapabilityDefaultGrant.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appCapabilityDefaultGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appProfileCapability`

CRUD operations for AppProfileCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `profileId` | UUID | Yes |
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appProfileCapability records
const items = await db.appProfileCapability.findMany({ select: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appProfileCapability.findOne({ id: '<UUID>', select: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appProfileCapability.create({ data: { profileId: '<UUID>', capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appProfileCapability.update({ where: { id: '<UUID>' }, data: { profileId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appProfileCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appMembership`

CRUD operations for AppMembership records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `updatedBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `isApproved` | Boolean | Yes |
| `isBanned` | Boolean | Yes |
| `isDisabled` | Boolean | Yes |
| `isVerified` | Boolean | Yes |
| `isActive` | Boolean | Yes |
| `isOwner` | Boolean | Yes |
| `isAdmin` | Boolean | Yes |
| `capabilities` | BitString | Yes |
| `granted` | BitString | Yes |
| `actorId` | UUID | Yes |
| `profileId` | UUID | Yes |

**Operations:**

```typescript
// List all appMembership records
const items = await db.appMembership.findMany({ select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isVerified: true, isActive: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, profileId: true } }).execute();

// Get one by id
const item = await db.appMembership.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isVerified: true, isActive: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, profileId: true } }).execute();

// Create
const created = await db.appMembership.create({ data: { createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isVerified: '<Boolean>', isActive: '<Boolean>', isOwner: '<Boolean>', isAdmin: '<Boolean>', capabilities: '<BitString>', granted: '<BitString>', actorId: '<UUID>', profileId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appMembership.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appMembership.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appProfileGrant`

CRUD operations for AppProfileGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `membershipId` | UUID | Yes |
| `profileId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appProfileGrant records
const items = await db.appProfileGrant.findMany({ select: { id: true, membershipId: true, profileId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appProfileGrant.findOne({ id: '<UUID>', select: { id: true, membershipId: true, profileId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appProfileGrant.create({ data: { membershipId: '<UUID>', profileId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appProfileGrant.update({ where: { id: '<UUID>' }, data: { membershipId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appProfileGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appMembershipProfile`

CRUD operations for AppMembershipProfile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `membershipId` | UUID | Yes |
| `profileId` | UUID | Yes |
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appMembershipProfile records
const items = await db.appMembershipProfile.findMany({ select: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appMembershipProfile.findOne({ id: '<UUID>', select: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appMembershipProfile.create({ data: { membershipId: '<UUID>', profileId: '<UUID>', actorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appMembershipProfile.update({ where: { id: '<UUID>' }, data: { membershipId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appMembershipProfile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appProfileDefinitionGrant`

CRUD operations for AppProfileDefinitionGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `profileId` | UUID | Yes |
| `capabilityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appProfileDefinitionGrant records
const items = await db.appProfileDefinitionGrant.findMany({ select: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appProfileDefinitionGrant.findOne({ id: '<UUID>', select: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appProfileDefinitionGrant.create({ data: { profileId: '<UUID>', capabilityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appProfileDefinitionGrant.update({ where: { id: '<UUID>' }, data: { profileId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appProfileDefinitionGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appInvite`

CRUD operations for AppInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `channel` | String | Yes |
| `email` | ConstructiveInternalTypeEmail | Yes |
| `phone` | String | Yes |
| `senderId` | UUID | Yes |
| `inviteToken` | String | Yes |
| `inviteValid` | Boolean | Yes |
| `inviteLimit` | Int | Yes |
| `inviteCount` | Int | Yes |
| `multiple` | Boolean | Yes |
| `data` | JSON | Yes |
| `profileId` | UUID | Yes |
| `expiresAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appInvite records
const items = await db.appInvite.findMany({ select: { id: true, channel: true, email: true, phone: true, senderId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, expiresAt: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appInvite.findOne({ id: '<UUID>', select: { id: true, channel: true, email: true, phone: true, senderId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, expiresAt: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appInvite.create({ data: { channel: '<String>', email: '<Email>', phone: '<String>', senderId: '<UUID>', inviteToken: '<String>', inviteValid: '<Boolean>', inviteLimit: '<Int>', inviteCount: '<Int>', multiple: '<Boolean>', data: '<JSON>', profileId: '<UUID>', expiresAt: '<Datetime>' }, select: { id: true } }).execute();

// Update
const updated = await db.appInvite.update({ where: { id: '<UUID>' }, data: { channel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgCapability`

CRUD operations for OrgCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `bitnum` | Int | Yes |
| `bitstr` | BitString | Yes |
| `description` | String | Yes |
| `kind` | String | Yes |

**Operations:**

```typescript
// List all orgCapability records
const items = await db.orgCapability.findMany({ select: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } }).execute();

// Get one by id
const item = await db.orgCapability.findOne({ id: '<UUID>', select: { id: true, name: true, bitnum: true, bitstr: true, description: true, kind: true } }).execute();

// Create
const created = await db.orgCapability.create({ data: { name: '<String>', bitnum: '<Int>', bitstr: '<BitString>', description: '<String>', kind: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgCapability.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgCapabilityDefaultCapability`

CRUD operations for OrgCapabilityDefaultCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilityId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgCapabilityDefaultCapability records
const items = await db.orgCapabilityDefaultCapability.findMany({ select: { id: true, capabilityId: true, entityId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgCapabilityDefaultCapability.findOne({ id: '<UUID>', select: { id: true, capabilityId: true, entityId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgCapabilityDefaultCapability.create({ data: { capabilityId: '<UUID>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgCapabilityDefaultCapability.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgCapabilityDefaultCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgCapabilityDefaultGrant`

CRUD operations for OrgCapabilityDefaultGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilityId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `grantorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgCapabilityDefaultGrant records
const items = await db.orgCapabilityDefaultGrant.findMany({ select: { id: true, capabilityId: true, isGrant: true, grantorId: true, entityId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgCapabilityDefaultGrant.findOne({ id: '<UUID>', select: { id: true, capabilityId: true, isGrant: true, grantorId: true, entityId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgCapabilityDefaultGrant.create({ data: { capabilityId: '<UUID>', isGrant: '<Boolean>', grantorId: '<UUID>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgCapabilityDefaultGrant.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgCapabilityDefaultGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgProfileCapability`

CRUD operations for OrgProfileCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `profileId` | UUID | Yes |
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgProfileCapability records
const items = await db.orgProfileCapability.findMany({ select: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgProfileCapability.findOne({ id: '<UUID>', select: { id: true, profileId: true, capabilityId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgProfileCapability.create({ data: { profileId: '<UUID>', capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgProfileCapability.update({ where: { id: '<UUID>' }, data: { profileId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgProfileCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembership`

CRUD operations for OrgMembership records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `updatedBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `isApproved` | Boolean | Yes |
| `isBanned` | Boolean | Yes |
| `isDisabled` | Boolean | Yes |
| `isActive` | Boolean | Yes |
| `isExternal` | Boolean | Yes |
| `isOwner` | Boolean | Yes |
| `isAdmin` | Boolean | Yes |
| `capabilities` | BitString | Yes |
| `granted` | BitString | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `isReadOnly` | Boolean | Yes |
| `profileId` | UUID | Yes |

**Operations:**

```typescript
// List all orgMembership records
const items = await db.orgMembership.findMany({ select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isActive: true, isExternal: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, entityId: true, isReadOnly: true, profileId: true } }).execute();

// Get one by id
const item = await db.orgMembership.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isBanned: true, isDisabled: true, isActive: true, isExternal: true, isOwner: true, isAdmin: true, capabilities: true, granted: true, actorId: true, entityId: true, isReadOnly: true, profileId: true } }).execute();

// Create
const created = await db.orgMembership.create({ data: { createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isActive: '<Boolean>', isExternal: '<Boolean>', isOwner: '<Boolean>', isAdmin: '<Boolean>', capabilities: '<BitString>', granted: '<BitString>', actorId: '<UUID>', entityId: '<UUID>', isReadOnly: '<Boolean>', profileId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembership.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembership.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgProfileGrant`

CRUD operations for OrgProfileGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `membershipId` | UUID | Yes |
| `profileId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgProfileGrant records
const items = await db.orgProfileGrant.findMany({ select: { id: true, membershipId: true, profileId: true, entityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgProfileGrant.findOne({ id: '<UUID>', select: { id: true, membershipId: true, profileId: true, entityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgProfileGrant.create({ data: { membershipId: '<UUID>', profileId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgProfileGrant.update({ where: { id: '<UUID>' }, data: { membershipId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgProfileGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembershipProfile`

CRUD operations for OrgMembershipProfile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `membershipId` | UUID | Yes |
| `profileId` | UUID | Yes |
| `actorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgMembershipProfile records
const items = await db.orgMembershipProfile.findMany({ select: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgMembershipProfile.findOne({ id: '<UUID>', select: { id: true, membershipId: true, profileId: true, actorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgMembershipProfile.create({ data: { membershipId: '<UUID>', profileId: '<UUID>', actorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembershipProfile.update({ where: { id: '<UUID>' }, data: { membershipId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembershipProfile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgProfileDefinitionGrant`

CRUD operations for OrgProfileDefinitionGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `profileId` | UUID | Yes |
| `capabilityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgProfileDefinitionGrant records
const items = await db.orgProfileDefinitionGrant.findMany({ select: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgProfileDefinitionGrant.findOne({ id: '<UUID>', select: { id: true, profileId: true, capabilityId: true, grantorId: true, isGrant: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgProfileDefinitionGrant.create({ data: { profileId: '<UUID>', capabilityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgProfileDefinitionGrant.update({ where: { id: '<UUID>' }, data: { profileId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgProfileDefinitionGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgInvite`

CRUD operations for OrgInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `channel` | String | Yes |
| `email` | ConstructiveInternalTypeEmail | Yes |
| `phone` | String | Yes |
| `senderId` | UUID | Yes |
| `receiverId` | UUID | Yes |
| `inviteToken` | String | Yes |
| `inviteValid` | Boolean | Yes |
| `inviteLimit` | Int | Yes |
| `inviteCount` | Int | Yes |
| `multiple` | Boolean | Yes |
| `data` | JSON | Yes |
| `profileId` | UUID | Yes |
| `isReadOnly` | Boolean | Yes |
| `expiresAt` | Datetime | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `entityId` | UUID | Yes |

**Operations:**

```typescript
// List all orgInvite records
const items = await db.orgInvite.findMany({ select: { id: true, channel: true, email: true, phone: true, senderId: true, receiverId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, isReadOnly: true, expiresAt: true, createdAt: true, updatedAt: true, entityId: true } }).execute();

// Get one by id
const item = await db.orgInvite.findOne({ id: '<UUID>', select: { id: true, channel: true, email: true, phone: true, senderId: true, receiverId: true, inviteToken: true, inviteValid: true, inviteLimit: true, inviteCount: true, multiple: true, data: true, profileId: true, isReadOnly: true, expiresAt: true, createdAt: true, updatedAt: true, entityId: true } }).execute();

// Create
const created = await db.orgInvite.create({ data: { channel: '<String>', email: '<Email>', phone: '<String>', senderId: '<UUID>', receiverId: '<UUID>', inviteToken: '<String>', inviteValid: '<Boolean>', inviteLimit: '<Int>', inviteCount: '<Int>', multiple: '<Boolean>', data: '<JSON>', profileId: '<UUID>', isReadOnly: '<Boolean>', expiresAt: '<Datetime>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgInvite.update({ where: { id: '<UUID>' }, data: { channel: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMember`

CRUD operations for OrgMember records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `isAdmin` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |

**Operations:**

```typescript
// List all orgMember records
const items = await db.orgMember.findMany({ select: { id: true, isAdmin: true, actorId: true, entityId: true } }).execute();

// Get one by id
const item = await db.orgMember.findOne({ id: '<UUID>', select: { id: true, isAdmin: true, actorId: true, entityId: true } }).execute();

// Create
const created = await db.orgMember.create({ data: { isAdmin: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMember.update({ where: { id: '<UUID>' }, data: { isAdmin: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMember.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appCapabilityDefault`

CRUD operations for AppCapabilityDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilities` | BitString | Yes |

**Operations:**

```typescript
// List all appCapabilityDefault records
const items = await db.appCapabilityDefault.findMany({ select: { id: true, capabilities: true } }).execute();

// Get one by id
const item = await db.appCapabilityDefault.findOne({ id: '<UUID>', select: { id: true, capabilities: true } }).execute();

// Create
const created = await db.appCapabilityDefault.create({ data: { capabilities: '<BitString>' }, select: { id: true } }).execute();

// Update
const updated = await db.appCapabilityDefault.update({ where: { id: '<UUID>' }, data: { capabilities: '<BitString>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appCapabilityDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgCapabilityDefault`

CRUD operations for OrgCapabilityDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilities` | BitString | Yes |
| `entityId` | UUID | Yes |

**Operations:**

```typescript
// List all orgCapabilityDefault records
const items = await db.orgCapabilityDefault.findMany({ select: { id: true, capabilities: true, entityId: true } }).execute();

// Get one by id
const item = await db.orgCapabilityDefault.findOne({ id: '<UUID>', select: { id: true, capabilities: true, entityId: true } }).execute();

// Create
const created = await db.orgCapabilityDefault.create({ data: { capabilities: '<BitString>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgCapabilityDefault.update({ where: { id: '<UUID>' }, data: { capabilities: '<BitString>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgCapabilityDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appCapabilityDefaultCapability`

CRUD operations for AppCapabilityDefaultCapability records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilityId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appCapabilityDefaultCapability records
const items = await db.appCapabilityDefaultCapability.findMany({ select: { id: true, capabilityId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appCapabilityDefaultCapability.findOne({ id: '<UUID>', select: { id: true, capabilityId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appCapabilityDefaultCapability.create({ data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appCapabilityDefaultCapability.update({ where: { id: '<UUID>' }, data: { capabilityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appCapabilityDefaultCapability.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appAdminGrant`

CRUD operations for AppAdminGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appAdminGrant records
const items = await db.appAdminGrant.findMany({ select: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appAdminGrant.findOne({ id: '<UUID>', select: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appAdminGrant.create({ data: { isGrant: '<Boolean>', actorId: '<UUID>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appAdminGrant.update({ where: { id: '<UUID>' }, data: { isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appAdminGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appOwnerGrant`

CRUD operations for AppOwnerGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appOwnerGrant records
const items = await db.appOwnerGrant.findMany({ select: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appOwnerGrant.findOne({ id: '<UUID>', select: { id: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appOwnerGrant.create({ data: { isGrant: '<Boolean>', actorId: '<UUID>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appOwnerGrant.update({ where: { id: '<UUID>' }, data: { isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appOwnerGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgAdminGrant`

CRUD operations for OrgAdminGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgAdminGrant records
const items = await db.orgAdminGrant.findMany({ select: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgAdminGrant.findOne({ id: '<UUID>', select: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgAdminGrant.create({ data: { isGrant: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgAdminGrant.update({ where: { id: '<UUID>' }, data: { isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgAdminGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgOwnerGrant`

CRUD operations for OrgOwnerGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `isGrant` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgOwnerGrant records
const items = await db.orgOwnerGrant.findMany({ select: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgOwnerGrant.findOne({ id: '<UUID>', select: { id: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgOwnerGrant.create({ data: { isGrant: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgOwnerGrant.update({ where: { id: '<UUID>' }, data: { isGrant: '<Boolean>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgOwnerGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgChartEdgeGrant`

CRUD operations for OrgChartEdgeGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `entityId` | UUID | Yes |
| `childId` | UUID | Yes |
| `parentId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `isGrant` | Boolean | Yes |
| `positionTitle` | String | Yes |
| `positionLevel` | Int | Yes |
| `createdAt` | Datetime | No |

**Operations:**

```typescript
// List all orgChartEdgeGrant records
const items = await db.orgChartEdgeGrant.findMany({ select: { id: true, entityId: true, childId: true, parentId: true, grantorId: true, isGrant: true, positionTitle: true, positionLevel: true, createdAt: true } }).execute();

// Get one by id
const item = await db.orgChartEdgeGrant.findOne({ id: '<UUID>', select: { id: true, entityId: true, childId: true, parentId: true, grantorId: true, isGrant: true, positionTitle: true, positionLevel: true, createdAt: true } }).execute();

// Create
const created = await db.orgChartEdgeGrant.create({ data: { entityId: '<UUID>', childId: '<UUID>', parentId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>', positionTitle: '<String>', positionLevel: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgChartEdgeGrant.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgChartEdgeGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appClaimedInvite`

CRUD operations for AppClaimedInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `data` | JSON | Yes |
| `senderId` | UUID | Yes |
| `receiverId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appClaimedInvite records
const items = await db.appClaimedInvite.findMany({ select: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appClaimedInvite.findOne({ id: '<UUID>', select: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appClaimedInvite.create({ data: { data: '<JSON>', senderId: '<UUID>', receiverId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appClaimedInvite.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appClaimedInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.membershipType`

CRUD operations for MembershipType records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | Int | No |
| `name` | String | Yes |
| `description` | String | Yes |
| `scope` | String | Yes |
| `parentMembershipType` | Int | Yes |
| `hasUsersTableEntry` | Boolean | Yes |

**Operations:**

```typescript
// List all membershipType records
const items = await db.membershipType.findMany({ select: { id: true, name: true, description: true, scope: true, parentMembershipType: true, hasUsersTableEntry: true } }).execute();

// Get one by id
const item = await db.membershipType.findOne({ id: '<Int>', select: { id: true, name: true, description: true, scope: true, parentMembershipType: true, hasUsersTableEntry: true } }).execute();

// Create
const created = await db.membershipType.create({ data: { name: '<String>', description: '<String>', scope: '<String>', parentMembershipType: '<Int>', hasUsersTableEntry: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.membershipType.update({ where: { id: '<Int>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.membershipType.delete({ where: { id: '<Int>' } }).execute();
```

### `db.appGrant`

CRUD operations for AppGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilities` | BitString | Yes |
| `isGrant` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appGrant records
const items = await db.appGrant.findMany({ select: { id: true, capabilities: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appGrant.findOne({ id: '<UUID>', select: { id: true, capabilities: true, isGrant: true, actorId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appGrant.create({ data: { capabilities: '<BitString>', isGrant: '<Boolean>', actorId: '<UUID>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.appGrant.update({ where: { id: '<UUID>' }, data: { capabilities: '<BitString>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgClaimedInvite`

CRUD operations for OrgClaimedInvite records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `data` | JSON | Yes |
| `senderId` | UUID | Yes |
| `receiverId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `entityId` | UUID | Yes |

**Operations:**

```typescript
// List all orgClaimedInvite records
const items = await db.orgClaimedInvite.findMany({ select: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true, entityId: true } }).execute();

// Get one by id
const item = await db.orgClaimedInvite.findOne({ id: '<UUID>', select: { id: true, data: true, senderId: true, receiverId: true, createdAt: true, updatedAt: true, entityId: true } }).execute();

// Create
const created = await db.orgClaimedInvite.create({ data: { data: '<JSON>', senderId: '<UUID>', receiverId: '<UUID>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgClaimedInvite.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgClaimedInvite.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgGrant`

CRUD operations for OrgGrant records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `capabilities` | BitString | Yes |
| `isGrant` | Boolean | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `grantorId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgGrant records
const items = await db.orgGrant.findMany({ select: { id: true, capabilities: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgGrant.findOne({ id: '<UUID>', select: { id: true, capabilities: true, isGrant: true, actorId: true, entityId: true, grantorId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgGrant.create({ data: { capabilities: '<BitString>', isGrant: '<Boolean>', actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgGrant.update({ where: { id: '<UUID>' }, data: { capabilities: '<BitString>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgGrant.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgChartEdge`

CRUD operations for OrgChartEdge records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `entityId` | UUID | Yes |
| `childId` | UUID | Yes |
| `parentId` | UUID | Yes |
| `positionTitle` | String | Yes |
| `positionLevel` | Int | Yes |

**Operations:**

```typescript
// List all orgChartEdge records
const items = await db.orgChartEdge.findMany({ select: { id: true, createdAt: true, updatedAt: true, entityId: true, childId: true, parentId: true, positionTitle: true, positionLevel: true } }).execute();

// Get one by id
const item = await db.orgChartEdge.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, entityId: true, childId: true, parentId: true, positionTitle: true, positionLevel: true } }).execute();

// Create
const created = await db.orgChartEdge.create({ data: { entityId: '<UUID>', childId: '<UUID>', parentId: '<UUID>', positionTitle: '<String>', positionLevel: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgChartEdge.update({ where: { id: '<UUID>' }, data: { entityId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgChartEdge.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appProfileTemplate`

CRUD operations for AppProfileTemplate records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `slug` | String | Yes |
| `description` | String | Yes |
| `capabilities` | BitString | Yes |
| `isDefault` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appProfileTemplate records
const items = await db.appProfileTemplate.findMany({ select: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appProfileTemplate.findOne({ id: '<UUID>', select: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appProfileTemplate.create({ data: { name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isDefault: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appProfileTemplate.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appProfileTemplate.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgProfileTemplate`

CRUD operations for OrgProfileTemplate records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `slug` | String | Yes |
| `description` | String | Yes |
| `capabilities` | BitString | Yes |
| `isDefault` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all orgProfileTemplate records
const items = await db.orgProfileTemplate.findMany({ select: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.orgProfileTemplate.findOne({ id: '<UUID>', select: { id: true, name: true, slug: true, description: true, capabilities: true, isDefault: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.orgProfileTemplate.create({ data: { name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isDefault: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgProfileTemplate.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgProfileTemplate.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appMembershipDefault`

CRUD operations for AppMembershipDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `updatedBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `isApproved` | Boolean | Yes |
| `isVerified` | Boolean | Yes |

**Operations:**

```typescript
// List all appMembershipDefault records
const items = await db.appMembershipDefault.findMany({ select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isVerified: true } }).execute();

// Get one by id
const item = await db.appMembershipDefault.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, isVerified: true } }).execute();

// Create
const created = await db.appMembershipDefault.create({ data: { createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', isVerified: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appMembershipDefault.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appMembershipDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembershipDefault`

CRUD operations for OrgMembershipDefault records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `updatedBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `isApproved` | Boolean | Yes |
| `entityId` | UUID | Yes |

**Operations:**

```typescript
// List all orgMembershipDefault records
const items = await db.orgMembershipDefault.findMany({ select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, entityId: true } }).execute();

// Get one by id
const item = await db.orgMembershipDefault.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, isApproved: true, entityId: true } }).execute();

// Create
const created = await db.orgMembershipDefault.create({ data: { createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', isApproved: '<Boolean>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembershipDefault.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembershipDefault.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.appProfile`

CRUD operations for AppProfile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `slug` | String | Yes |
| `description` | String | Yes |
| `capabilities` | BitString | Yes |
| `isSystem` | Boolean | Yes |
| `isDefault` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all appProfile records
const items = await db.appProfile.findMany({ select: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.appProfile.findOne({ id: '<UUID>', select: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.appProfile.create({ data: { name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isSystem: '<Boolean>', isDefault: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.appProfile.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.appProfile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgProfile`

CRUD operations for OrgProfile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `name` | String | Yes |
| `slug` | String | Yes |
| `description` | String | Yes |
| `capabilities` | BitString | Yes |
| `isSystem` | Boolean | Yes |
| `isDefault` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `entityId` | UUID | Yes |

**Operations:**

```typescript
// List all orgProfile records
const items = await db.orgProfile.findMany({ select: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true, entityId: true } }).execute();

// Get one by id
const item = await db.orgProfile.findOne({ id: '<UUID>', select: { id: true, name: true, slug: true, description: true, capabilities: true, isSystem: true, isDefault: true, createdAt: true, updatedAt: true, entityId: true } }).execute();

// Create
const created = await db.orgProfile.create({ data: { name: '<String>', slug: '<String>', description: '<String>', capabilities: '<BitString>', isSystem: '<Boolean>', isDefault: '<Boolean>', entityId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgProfile.update({ where: { id: '<UUID>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgProfile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMemberProfile`

CRUD operations for OrgMemberProfile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `membershipId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `actorId` | UUID | Yes |
| `displayName` | String | Yes |
| `email` | String | Yes |
| `title` | String | Yes |
| `bio` | String | Yes |
| `profilePicture` | ConstructiveInternalTypeImage | Yes |

**Operations:**

```typescript
// List all orgMemberProfile records
const items = await db.orgMemberProfile.findMany({ select: { id: true, createdAt: true, updatedAt: true, membershipId: true, entityId: true, actorId: true, displayName: true, email: true, title: true, bio: true, profilePicture: true } }).execute();

// Get one by id
const item = await db.orgMemberProfile.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, membershipId: true, entityId: true, actorId: true, displayName: true, email: true, title: true, bio: true, profilePicture: true } }).execute();

// Create
const created = await db.orgMemberProfile.create({ data: { membershipId: '<UUID>', entityId: '<UUID>', actorId: '<UUID>', displayName: '<String>', email: '<String>', title: '<String>', bio: '<String>', profilePicture: '<Image>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMemberProfile.update({ where: { id: '<UUID>' }, data: { membershipId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMemberProfile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgMembershipSetting`

CRUD operations for OrgMembershipSetting records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `updatedBy` | UUID | Yes |
| `createdByPrincipal` | UUID | Yes |
| `updatedByPrincipal` | UUID | Yes |
| `entityId` | UUID | Yes |
| `deleteMemberCascadeChildren` | Boolean | Yes |
| `createChildCascadeOwners` | Boolean | Yes |
| `createChildCascadeAdmins` | Boolean | Yes |
| `createChildCascadeMembers` | Boolean | Yes |
| `allowExternalMembers` | Boolean | Yes |
| `allowPrincipalOwnedApiKeys` | Boolean | Yes |
| `apiKeyMaxDuration` | Interval | Yes |
| `inviteProfileAssignmentMode` | String | Yes |
| `populateMemberEmail` | Boolean | Yes |
| `limitAllocationMode` | String | Yes |

**Operations:**

```typescript
// List all orgMembershipSetting records
const items = await db.orgMembershipSetting.findMany({ select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, entityId: true, deleteMemberCascadeChildren: true, createChildCascadeOwners: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, inviteProfileAssignmentMode: true, populateMemberEmail: true, limitAllocationMode: true } }).execute();

// Get one by id
const item = await db.orgMembershipSetting.findOne({ id: '<UUID>', select: { id: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, createdByPrincipal: true, updatedByPrincipal: true, entityId: true, deleteMemberCascadeChildren: true, createChildCascadeOwners: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, inviteProfileAssignmentMode: true, populateMemberEmail: true, limitAllocationMode: true } }).execute();

// Create
const created = await db.orgMembershipSetting.create({ data: { createdBy: '<UUID>', updatedBy: '<UUID>', createdByPrincipal: '<UUID>', updatedByPrincipal: '<UUID>', entityId: '<UUID>', deleteMemberCascadeChildren: '<Boolean>', createChildCascadeOwners: '<Boolean>', createChildCascadeAdmins: '<Boolean>', createChildCascadeMembers: '<Boolean>', allowExternalMembers: '<Boolean>', allowPrincipalOwnedApiKeys: '<Boolean>', apiKeyMaxDuration: '<Interval>', inviteProfileAssignmentMode: '<String>', populateMemberEmail: '<Boolean>', limitAllocationMode: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgMembershipSetting.update({ where: { id: '<UUID>' }, data: { createdBy: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgMembershipSetting.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.query.appCapabilitiesGetPaddedMask`

appCapabilitiesGetPaddedMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |

```typescript
const result = await db.query.appCapabilitiesGetPaddedMask({ mask: '<BitString>' }).execute();
```

### `db.query.orgCapabilitiesGetPaddedMask`

orgCapabilitiesGetPaddedMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |

```typescript
const result = await db.query.orgCapabilitiesGetPaddedMask({ mask: '<BitString>' }).execute();
```

### `db.query.orgIsManagerOf`

orgIsManagerOf

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `targetEntityId` | UUID |
  | `managerId` | UUID |
  | `userId` | UUID |
  | `maxDepth` | Int |

```typescript
const result = await db.query.orgIsManagerOf({ targetEntityId: '<UUID>', managerId: '<UUID>', userId: '<UUID>', maxDepth: '<Int>' }).execute();
```

### `db.query.appCapabilitiesGetMask`

appCapabilitiesGetMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `ids` | [UUID] |

```typescript
const result = await db.query.appCapabilitiesGetMask({ ids: '<UUID>' }).execute();
```

### `db.query.orgCapabilitiesGetMask`

orgCapabilitiesGetMask

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `ids` | [UUID] |

```typescript
const result = await db.query.orgCapabilitiesGetMask({ ids: '<UUID>' }).execute();
```

### `db.query.getOrganizationId`

getOrganizationId

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `entityType` | String |
  | `entityId` | UUID |

```typescript
const result = await db.query.getOrganizationId({ entityType: '<String>', entityId: '<UUID>' }).execute();
```

### `db.query.appCapabilitiesGetMaskByNames`

appCapabilitiesGetMaskByNames

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `names` | [String] |

```typescript
const result = await db.query.appCapabilitiesGetMaskByNames({ names: '<String>' }).execute();
```

### `db.query.orgCapabilitiesGetMaskByNames`

orgCapabilitiesGetMaskByNames

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `names` | [String] |

```typescript
const result = await db.query.orgCapabilitiesGetMaskByNames({ names: '<String>' }).execute();
```

### `db.query.appCapabilitiesGetByMask`

Reads and enables pagination through a set of `AppCapability`.

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |
  | `first` | Int |
  | `offset` | Int |
  | `after` | Cursor |

```typescript
const result = await db.query.appCapabilitiesGetByMask({ mask: '<BitString>', first: '<Int>', offset: '<Int>', after: '<Cursor>' }).execute();
```

### `db.query.orgCapabilitiesGetByMask`

Reads and enables pagination through a set of `OrgCapability`.

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `mask` | BitString |
  | `first` | Int |
  | `offset` | Int |
  | `after` | Cursor |

```typescript
const result = await db.query.orgCapabilitiesGetByMask({ mask: '<BitString>', first: '<Int>', offset: '<Int>', after: '<Cursor>' }).execute();
```

### `db.mutation.acceptAppInvite`

acceptAppInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptAppInviteInput (required) |

```typescript
const result = await db.mutation.acceptAppInvite({ input: { inviteId: '<UUID>' } }).execute();
```

### `db.mutation.acceptOrgInvite`

acceptOrgInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptOrgInviteInput (required) |

```typescript
const result = await db.mutation.acceptOrgInvite({ input: { inviteId: '<UUID>' } }).execute();
```

### `db.mutation.submitAppInviteCode`

submitAppInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitAppInviteCodeInput (required) |

```typescript
const result = await db.mutation.submitAppInviteCode({ input: { token: '<String>' } }).execute();
```

### `db.mutation.submitOrgInviteCode`

submitOrgInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitOrgInviteCodeInput (required) |

```typescript
const result = await db.mutation.submitOrgInviteCode({ input: { token: '<String>' } }).execute();
```

### `db.mutation.provisionAppUser`

provisionAppUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUserInput (required) |

```typescript
const result = await db.mutation.provisionAppUser({ input: { email: '<String>', phone: '<String>', profileId: '<UUID>' } }).execute();
```

### `db.mutation.provisionOrgUser`

provisionOrgUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUserInput (required) |

```typescript
const result = await db.mutation.provisionOrgUser({ input: { entityId: '<UUID>', email: '<String>', phone: '<String>', profileId: '<UUID>', isReadOnly: '<Boolean>' } }).execute();
```

### `db.mutation.provisionAppUsersBulk`

provisionAppUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUsersBulkInput (required) |

```typescript
const result = await db.mutation.provisionAppUsersBulk({ input: { users: '<JSON>' } }).execute();
```

### `db.mutation.provisionOrgUsersBulk`

provisionOrgUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUsersBulkInput (required) |

```typescript
const result = await db.mutation.provisionOrgUsersBulk({ input: { entityId: '<UUID>', users: '<JSON>' } }).execute();
```

### `db.mutation.provisionBucket`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

```typescript
const result = await db.mutation.provisionBucket({ input: { bucketKey: '<String>', ownerId: '<UUID>' } }).execute();
```

---

Built by the [Constructive](https://constructive.io) team.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
