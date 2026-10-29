import { LayoutDashboardIcon, type LucideIcon } from 'lucide-react';

/** A sidebar link to a hand-written page. */
export type CustomNavEntry = { label: string; href: string; icon: LucideIcon };

/**
 * The home row, first in the sidebar. When a domain screen becomes the home
 * page (src/app/(app)/page.tsx), name it here.
 */
export const homeNav: Omit<CustomNavEntry, 'href'> = { label: 'Dashboard', icon: LayoutDashboardIcon };

/**
 * Hand-written pages (src/app/(app)/<slug>/page.tsx): the app's primary
 * screens, listed right below home and above the generated "Data" pages.
 * Append an entry here; the shell needs no edit.
 */
export const customNav: CustomNavEntry[] = [];
