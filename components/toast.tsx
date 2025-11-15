import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ToastProps {
  message: string;
  duration?: number; // en ms
}

export const Toast = ({ message, duration = 3000 }: ToastProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animar entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animar salida después de duration
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, duration);

    return () => clearTimeout(timeout);
  }, [fadeAnim, duration]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#e80b0bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '500',
  },
});
