import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { default as styles } from '../styles';

export const SignInScreen = ({ onSignIn }: { onSignIn: () => void }) => {
  const [username, setUsername] = useState('');
  const { login } = useApp();

  const handleSignIn = () => {
    if (username.trim()) {
      login(username.trim());
      onSignIn();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.centerContainer}>
        <Text style={styles.title}>🍅 Pomodoro Sessions</Text>
        <Text style={styles.subtitle}>Bienvenido</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, !username.trim() && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={!username.trim()}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
