// screens/ForgotUsernameScreen.tsx
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { solicitarRecuperacionUsuario, verificarRecuperacionUsuario } from '../../services/usuarios';
import { default as styles } from '../styles';

export const ForgotUsernameScreen = ({
  onBackToSignIn,
  onSwitchToSignUp
}: {
  onBackToSignIn: () => void;
  onSwitchToSignUp: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [codigoRecuperacion, setCodigoRecuperacion] = useState('');
  const [paso, setPaso] = useState<'solicitud' | 'verificacion'>('solicitud');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSolicitarRecuperacion = async () => {
    if (!email.trim()) {
      setMensaje('Por favor ingresa tu email');
      return;
    }

    if (!email.includes('@')) {
      setMensaje('Por favor ingresa un email válido');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const data = await solicitarRecuperacionUsuario(email.trim());
      console.log("Solicitud de recuperación:", data);
      setMensaje('Si el email existe, se ha enviado un código de verificación');
      setPaso('verificacion');
    } catch (error: any) {
      setMensaje(error.response?.data?.detail || 'Error al solicitar recuperación');
    } finally {
      setCargando(false);
    }
  };

  const handleVerificarRecuperacion = async () => {
    if (!codigoRecuperacion.trim()) {
      setMensaje('Por favor ingresa el código de verificación');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const data = await verificarRecuperacionUsuario(email.trim(), codigoRecuperacion.trim());
      console.log("Recuperación exitosa:", data);
      setMensaje('Se ha enviado un recordatorio de tu usuario a tu email');
      
      // Opcional: regresar automáticamente después de 3 segundos
      setTimeout(() => {
        onBackToSignIn();
      }, 3000);
      
    } catch (error: any) {
      setMensaje(error.response?.data?.detail || 'Error al verificar código');
    } finally {
      setCargando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setCargando(true);
    try {
      await solicitarRecuperacionUsuario(email.trim());
      setMensaje('Nuevo código enviado');
    } catch (error: any) {
      setMensaje(error.response?.data?.detail || 'Error al reenviar código');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <Text style={styles.title}>🍅 Pomodoro Sessions</Text>
          <Text style={styles.subtitle}>Recuperar Usuario</Text>

          {paso === 'solicitud' ? (
            <>
              <Text style={styles.instrucciones}>
                Ingresa tu email y te enviaremos un código para recuperar tu usuario
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Tu email registrado"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={[styles.button, (!email.trim() || cargando) && styles.buttonDisabled]}
                onPress={handleSolicitarRecuperacion}
                disabled={!email.trim() || cargando}
              >
                <Text style={styles.buttonText}>
                  {cargando ? 'Enviando código...' : 'Enviar código de recuperación'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.instrucciones}>
                Ingresa el código de verificación que enviamos a {email}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Código de 6 dígitos"
                value={codigoRecuperacion}
                onChangeText={setCodigoRecuperacion}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={[styles.button, (!codigoRecuperacion.trim() || cargando) && styles.buttonDisabled]}
                onPress={handleVerificarRecuperacion}
                disabled={!codigoRecuperacion.trim() || cargando}
              >
                <Text style={styles.buttonText}>
                  {cargando ? 'Verificando...' : 'Verificar código'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleReenviarCodigo} disabled={cargando}>
                <Text style={styles.linkText}>¿No recibiste el código? Reenviar</Text>
              </TouchableOpacity>
            </>
          )}

          {mensaje ? <Text style={styles.messageText}>{mensaje}</Text> : null}
          
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={onBackToSignIn}>
              <Text style={styles.linkText}>← Volver a Iniciar Sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onSwitchToSignUp} style={{ marginTop: 10 }}>
              <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotUsernameScreen;