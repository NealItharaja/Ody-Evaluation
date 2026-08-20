import type { IconName } from '@ody/shared';

export type NavRoute = {
  /** expo-router href. */
  href: '/' | '/orders' | '/menu' | '/crm' | '/settings' | '/ui-library';
  label: string;
  icon: IconName;
  /** Grouping in the sidebar. */
  section: 'operations' | 'workspace';
};

/**
 * Single source of truth for navigation. The sidebar, the compact top-bar menu
 * and the page titles all read from here.
 */
export const NAV_ROUTES: readonly NavRoute[] = [
  { href: '/', label: 'Home', icon: 'home', section: 'operations' },
  { href: '/orders', label: 'Orders', icon: 'clipboard', section: 'operations' },
  { href: '/menu', label: 'Menu', icon: 'book-open', section: 'operations' },
  { href: '/crm', label: 'Customers', icon: 'users', section: 'operations' },
  { href: '/settings', label: 'Settings', icon: 'settings', section: 'workspace' },
  { href: '/ui-library', label: 'UI Library', icon: 'layers', section: 'workspace' },
] as const;

export const SECTION_LABELS: Record<NavRoute['section'], string> = {
  operations: 'Operations',
  workspace: 'Workspace',
};
