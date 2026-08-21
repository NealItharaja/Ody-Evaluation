import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppShell } from '@/components/shell/AppShell';
import { WebFonts } from '@/components/shell/WebFonts';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <WebFonts />
      <StatusBar style="light" />
      <AppShell>
        <Slot />
      </AppShell>
    </AppProviders>
  );
}
