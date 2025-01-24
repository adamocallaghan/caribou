import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import Page from '../components/Page';

const PAGES = [
  { name: 'Dashboard', color: '#1a1a1a' },
  { name: 'Launch', color: '#2a2a2a' },
  { name: 'Swap', color: '#3a3a3a' },
  { name: 'Lend', color: '#4a4a4a' },
  { name: 'Borrow', color: '#5a5a5a' },
  { name: 'Mint', color: '#6a6a6a' },
  { name: 'Earn', color: '#7a7a7a' },
];

const { height } = Dimensions.get('window');
const SNAP_POINTS = PAGES.map((_, i) => i * -height);

export default function Home() {
  const translateY = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPage = (nextIndex: number) => {
    if (nextIndex >= 0 && nextIndex < PAGES.length) {
      translateY.value = withSpring(SNAP_POINTS[nextIndex], {
        damping: 20,
      });
      setActiveIndex(nextIndex);
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          goToPage(activeIndex - 1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          goToPage(activeIndex + 1);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeIndex]);

  // Add mouse wheel support
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (e.deltaY > 0) {
          goToPage(activeIndex + 1);
        } else if (e.deltaY < 0) {
          goToPage(activeIndex - 1);
        }
      };

      const element = document.getElementById('pages-container');
      if (element) {
        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => element.removeEventListener('wheel', handleWheel);
      }
    }
  }, [activeIndex]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      const velocity = event.velocityY;
      const currentPosition = translateY.value;
      
      let nearestPoint = SNAP_POINTS[activeIndex];
      let nextIndex = activeIndex;

      if (velocity > 500 && activeIndex > 0) {
        // Swipe down - go to previous page
        nextIndex = activeIndex - 1;
        nearestPoint = SNAP_POINTS[nextIndex];
      } else if (velocity < -500 && activeIndex < PAGES.length - 1) {
        // Swipe up - go to next page
        nextIndex = activeIndex + 1;
        nearestPoint = SNAP_POINTS[nextIndex];
      } else {
        // Find nearest snap point based on current position
        const distances = SNAP_POINTS.map(point => 
          Math.abs(point - currentPosition)
        );
        nextIndex = distances.indexOf(Math.min(...distances));
        nearestPoint = SNAP_POINTS[nextIndex];
      }

      translateY.value = withSpring(nearestPoint, {
        velocity: velocity,
        damping: 20,
      });
      
      runOnJS(setActiveIndex)(nextIndex);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View 
          nativeID="pages-container"
          style={[styles.pagesContainer, animatedStyle]}
        >
          {PAGES.map((page, index) => (
            <Page 
              key={index} 
              name={page.name} 
              color={page.color}
              isActive={index === activeIndex}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pagesContainer: {
    height: height * PAGES.length,
  },
});
