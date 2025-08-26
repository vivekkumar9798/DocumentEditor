import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SimplifiedDocumentEditor } from './src/components/DocumentEditor/SimplifiedIndex';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const handleBackPress = () => {
    console.log('Back button pressed');
    // Add navigation logic here if needed
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <SimplifiedDocumentEditor onShowPrivacy={() => console.log('Privacy pressed')} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
});

export default App;
