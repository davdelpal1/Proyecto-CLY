import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Animated, Platform } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { motion } from '@cly/design-tokens';
import { useReducedMotion } from '../theme/useReducedMotion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Entrada ligera (fundido + deslizamiento). Con "reducir movimiento" aparece sin animar. */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.slow,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [reduced, delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
