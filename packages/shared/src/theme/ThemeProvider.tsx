import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

import { theme as defaultTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ children, value }: { children: ReactNode; value?: Theme }) {
  const resolved = value ?? defaultTheme;
  return <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Responsive helper for layout decisions. Kept in the design system so pages
 * don't invent their own breakpoint math.
 */
export function useBreakpoint(): { width: number; breakpoint: Breakpoint; isCompact: boolean } {
  const { width } = useWindowDimensions();
  const { breakpoints } = defaultTheme.layout;

  return useMemo(() => {
    const breakpoint: Breakpoint =
      width >= breakpoints.xl
        ? 'xl'
        : width >= breakpoints.lg
          ? 'lg'
          : width >= breakpoints.md
            ? 'md'
            : 'sm';
    return { width, breakpoint, isCompact: width < breakpoints.md };
  }, [width, breakpoints.md, breakpoints.lg, breakpoints.xl]);
}
