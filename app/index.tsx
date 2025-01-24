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

const MAIN_PAGES = [
  { name: 'Dashboard', color: '#1a1a1a' },
  { name: 'Launch', color: '#2a2a2a' },
  { name: 'Swap', color: '#3a3a3a' },
  { name: 'Lend', color: '#4a4a4a' },
  { name: 'Borrow', color: '#5a5a5a' },
  { name: 'Mint', color: '#6a6a6a' },
  { name: 'Earn', color: '#7a7a7a' },
];

const CARDS = ['Card A', 'Card B', 'Card C', 'Card D', 'Card E'];

const { height, width } = Dimensions.get('window');
const VERTICAL_SNAP_POINTS = MAIN_PAGES.map((_, i) => i * -height);
const HORIZONTAL_SNAP_POINTS = CARDS.map((_, i) => i * -width);

export default function Home() {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const [activeVerticalIndex, setActiveVerticalIndex] = useState(0);
  const [activeHorizontalIndex, setActiveHorizontalIndex] = useState(0);

  const goToVerticalPage = (nextIndex: number) => {
    if (nextIndex >= 0 && nextIndex < MAIN_PAGES.length) {
      translateY.value = withSpring(VERTICAL_SNAP_POINTS[nextIndex], {
        damping: 20,
      });
      setActiveVerticalIndex(nextIndex);
    }
  };

  const goToHorizontalPage = (nextIndex: number) => {
    if (nextIndex >= 0 && nextIndex < CARDS.length) {
      translateX.value = withSpring(HORIZONTAL_SNAP_POINTS[nextIndex], {
        damping: 20,
      });
      setActiveHorizontalIndex(nextIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        switch (e.key) {
          case 'ArrowUp':
            goToVerticalPage(activeVerticalIndex - 1);
            break;
          case 'ArrowDown':
            goToVerticalPage(activeVerticalIndex + 1);
            break;
          case 'ArrowLeft':
            goToHorizontalPage(activeHorizontalIndex - 1);
            break;
          case 'ArrowRight':
            goToHorizontalPage(activeHorizontalIndex + 1);
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeVerticalIndex, activeHorizontalIndex]);

  // Mouse wheel support
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (e.shiftKey) {
          // Horizontal scrolling with shift key
          if (e.deltaY > 0) {
            goToHorizontalPage(activeHorizontalIndex + 1);
          } else {
            goToHorizontalPage(activeHorizontalIndex - 1);
          }
        } else {
          // Vertical scrolling
          if (e.deltaY > 0) {
            goToVerticalPage(activeVerticalIndex + 1);
          } else {
            goToVerticalPage(activeVerticalIndex - 1);
          }
        }
      };

      const element = document.getElementById('pages-container');
      if (element) {
        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => element.removeEventListener('wheel', handleWheel);
      }
    }
  }, [activeVerticalIndex, activeHorizontalIndex]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Determine if the gesture is more horizontal or vertical
      const dx = Math.abs(event.translationX);
      const dy = Math.abs(event.translationY);
      
      if (dx > dy) {
        // Horizontal movement
        translateX.value = ctx.startX + event.translationX;
      } else {
        // Vertical movement
        translateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: (event) => {
      const dx = Math.abs(event.translationX);
      const dy = Math.abs(event.translationY);

      if (dx > dy) {
        // Handle horizontal swipe
        const velocity = event.velocityX;
        let nextIndex = activeHorizontalIndex;

        if (velocity < -500 && activeHorizontalIndex < CARDS.length - 1) {
          nextIndex = activeHorizontalIndex + 1;
        } else if (velocity > 500 && activeHorizontalIndex > 0) {
          nextIndex = activeHorizontalIndex - 1;
        }

        translateX.value = withSpring(HORIZONTAL_SNAP_POINTS[nextIndex], {
          velocity: velocity,
          damping: 20,
        });
        runOnJS(setActiveHorizontalIndex)(nextIndex);
      } else {
        // Handle vertical swipe
        const velocity = event.velocityY;
        let nextIndex = activeVerticalIndex;

        if (velocity < -500 && activeVerticalIndex < MAIN_PAGES.length - 1) {
          nextIndex = activeVerticalIndex + 1;
        } else if (velocity > 500 && activeVerticalIndex > 0) {
          nextIndex = activeVerticalIndex - 1;
        }

        translateY.value = withSpring(VERTICAL_SNAP_POINTS[nextIndex], {
          velocity: velocity,
          damping: 20,
        });
        runOnJS(setActiveVerticalIndex)(nextIndex);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View 
          nativeID="pages-container"
          style={[styles.pagesContainer, animatedStyle]}
        >
          {MAIN_PAGES.map((mainPage, vIndex) => (
            <View key={vIndex} style={styles.horizontalContainer}>
              <Page 
                name={mainPage.name}
                color={mainPage.color}
                isActive={vIndex === activeVerticalIndex && activeHorizontalIndex === 0}
              />
              {CARDS.map((card, hIndex) => (
                <Page
                  key={`${vIndex}-${hIndex}`}
                  name={`${mainPage.name} - ${card}`}
                  color={mainPage.color}
                  isActive={vIndex === activeVerticalIndex && hIndex + 1 === activeHorizontalIndex}
                />
              ))}
            </View>
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
    height: height * MAIN_PAGES.length,
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: width * (CARDS.length + 1), // +1 for the main page
  },
});
