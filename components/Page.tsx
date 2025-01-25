import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';

interface PageProps {
  name: string;
  color: string;
  textColor: string;
  isActive?: boolean;
}

export default function Page({ name, color, textColor, isActive }: PageProps) {
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
      {/* Main content container */}
      <View style={styles.mainContent}>
        <Text style={[
          styles.text,
          { color: textColor },
          isSmallDevice && styles.smallText
        ]}>
          {name}
        </Text>
      </View>

      {/* Bottom hint container */}
      <View style={styles.hintContainer}>
        <Text style={[
          styles.hint,
          { color: `${textColor}99` },
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 24,
  },
  hintContainer: {
    width: '100%',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
  },
  smallHint: {
    fontSize: 12,
    paddingBottom: 20,
  },
}); 