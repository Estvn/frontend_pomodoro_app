import { iniciarSesion } from '@/services/usuarios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { default as styles } from '../styles';

export const SignInScreen = ({
  toHome,
  onSwitchToSignUp,
}: {
  toHome: () => void;
  onSwitchToSignUp: () => void;
}) => {
  const [username, setUsername] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { login } = useApp();

  const handleSignIn = async () => {
    if (!username.trim()) return;
    try {
      const data = await iniciarSesion(username.trim());
      const usuario = {
        id_user: data.id_user,
        username: data.nickname,
      };
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      login(usuario.id_user, usuario.username);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setMensaje('Usuario no encontrado o error de conexión');
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
        {mensaje !== '' && <Text style={styles.errorText}>{mensaje}</Text>}
        <TouchableOpacity onPress={onSwitchToSignUp}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
