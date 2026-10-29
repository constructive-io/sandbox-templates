# Conventions

Rules for app code in this template. The app builds as a static export
(`output: 'export'` in `next.config.ts`). The first rule follows from that.

## Routes: no path parameters

Do not create `[param]` route directories. A static export cannot build them,
because entity IDs exist only at runtime.

For a detail view, create a static route that reads the ID from a search param:

1. Register the route in `src/app-routes.ts` with `parseAsString` in
   `searchParams`.
2. Read the ID with `useSearchParams().get('id')` or with nuqs
   `useQueryState`.
3. Wrap the component in `<Suspense>`. Static generation requires this
   boundary around `useSearchParams`.

The org routes show the pattern: `/orgs/members?orgId=...`, built with
`buildOrgRoute('ORG_MEMBERS', orgId)`.

## Create and edit flows: stack cards

Create and edit flows open as stack cards, not as separate pages or dialogs.

```tsx
const { push } = useCardStack();

push({
	id: 'edit-password',
	title: 'Change password',
	description: 'Update your account password',
	Component: EditPasswordCard,
	props: {},
	width: 480,
});
```

See `src/components/account/edit-password-card.tsx` for a complete example.

## Query errors: always a retry control

Each query error state renders a retry control that calls `refetch()`. Do not
show an error message without a retry control.

## Scrolling

The `<main>` element in the app shell scrolls. Pages do not add their own
scroll wrapper. If a page needs an inner scroll area, for example a fixed
header with scrolling content, give the page `h-full` and put
`overflow-y-auto` on the inner container.
