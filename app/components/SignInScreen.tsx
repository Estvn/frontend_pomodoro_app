import { Toast } from '@/components/toast';
import { iniciarSesion } from '@/services/usuarios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { default as styles } from '../styles';

export const SignInScreen = ({
  toHome,
  onSwitchToSignUp,
  onForgotUsername
}: {
  toHome: () => void;
  onSwitchToSignUp: () => void;
  onForgotUsername: () => void;
}) => {
  const [username, setUsername] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();

  useEffect(() => {
    const requestNotificationPermissions = async () => {
      if (Platform.OS === 'web') return;

      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') await Notifications.requestPermissionsAsync();

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('pomodoro-timer', {
            name: 'Pomodoro Timer',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [500, 200, 500],
            sound: 'default',
          });
        }
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    requestNotificationPermissions();
  }, []);

  const handleSignIn = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setMensaje(''); // limpiar mensaje previo

    try {
      const data = await iniciarSesion(username.trim());

      if (!data?.id_user) {
        setMensaje('Usuario no encontrado. Revisa tu nombre de usuario.');
        return;
      }

      const usuario = {
        id_user: data.id_user,
        username: data.nickname,
      };

      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      login(usuario.id_user, usuario.username);
      toHome();
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);

      if (error.response?.status === 404) {
        setMensaje('Usuario no encontrado. Revisa tu nombre de usuario.');
      } else {
        setMensaje('Error de conexión. Intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.centerContainer}>
        <Text style={styles.title}>🍅 Pomodoro Sessions</Text>
        <Text style={styles.subtitle}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Tu nombre de usuario"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setMensaje(''); // limpiar mensaje mientras escribe
          }}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, (!username.trim() || loading) && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={!username.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
        </TouchableOpacity>

        {mensaje ? <Toast message={mensaje} /> : null}

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={onSwitchToSignUp}>
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onForgotUsername} style={{ marginTop: 10 }}>
            <Text style={styles.linkText}>¿Olvidaste tu usuario?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
