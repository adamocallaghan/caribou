import { View, Text, StyleSheet, Dimensions, Platform, useWindowDimensions } from 'react-native';

interface PageProps {
  name: string;
  color: string;
  isActive?: boolean;
}

export default function Page({ name, color, isActive }: PageProps) {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 380;

  return (
    <View style={[
      styles.page, 
      { 
        backgroundColor: color,
        width: width,
        height: height,
      }
    ]}>
      <View style={styles.contentContainer}>
        <Text style={[
          styles.text,
          isSmallDevice && styles.smallText
        ]}>
          {name}
        </Text>
        <Text style={[
          styles.hint,
          isSmallDevice && styles.smallHint
        ]}>
          {Platform.OS === 'web' ? 'Use ↑↓ arrows, mouse wheel, or drag to navigate' : 'Swipe to navigate'}
          {isActive && ' • Current Page'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '80%',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 24,
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  smallHint: {
    fontSize: 12,
    bottom: 20,
  },
}); 