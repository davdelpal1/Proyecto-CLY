import { useWindowDimensions } from 'react-native';
import { getBreakpoint } from '@cly/design-tokens';
import type { Breakpoint } from '@cly/design-tokens';

export function useBreakpoint(): { breakpoint: Breakpoint; width: number; isPhone: boolean } {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  return { breakpoint, width, isPhone: breakpoint === 'phone' };
}
