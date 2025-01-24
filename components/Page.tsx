import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface PageProps {
  name: string;
  color: string;
  isActive?: boolean;
}

export default function Page({ name, color, isActive }: PageProps) {
  return (
    <View style={[styles.page, { backgroundColor: color }]}>
      <Text style={styles.text}>{name}</Text>
      <Text style={styles.hint}>
        Use ↑↓ arrows, mouse wheel, or drag to navigate
        {isActive && ' • Current Page'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: Dimensions.get('window').height,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
}); 