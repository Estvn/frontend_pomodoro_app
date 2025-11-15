import React, { useEffect, useState } from 'react';
import { Animated, Modal, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { crearSesion } from '../../services/sesiones';
import { useApp } from '../context/AppContext';
import styles from '../styles';
import { formatTimeDetailed } from '../utils/helpers';

export const HomeScreen = ({ onNavigateToSpace }: { onNavigateToSpace: (id: string) => void }) => {
  const { user, spaces, logout, loadSpacesFromBackend } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [spaceName, setSpaceName] = useState('');

  // 🔹 Animación de la flecha
  const arrowAnim = new Animated.Value(0);
  useEffect(() => {
    if (spaces.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, { toValue: -10, duration: 600, useNativeDriver: true }),
          Animated.timing(arrowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [spaces.length]);

  // 🔹 Crear nueva sesión con validación de caracteres
  const handleCreateSpace = async () => {
    const trimmedName = spaceName.trim();

    // Validación vacía
    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: 'Nombre vacío',
        text2: 'Por favor ingresa un nombre para la sesión',
      });
      return;
    }

    // Validación usuario
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se encontró usuario, por favor inicia sesión',
      });
      return;
    }

    // Validación caracteres especiales (solo letras, números, espacios, guiones y guion bajo)
    const validNameRegex = /^[a-zA-Z0-9 _-]+$/;
    if (!validNameRegex.test(trimmedName)) {
      Toast.show({
        type: 'error',
        text1: 'Nombre inválido',
        text2: 'El nombre solo puede contener letras, números, espacios, guiones y guion bajo',
      });
      return;
    }

    try {
      await crearSesion(user.id_user, trimmedName);
      await loadSpacesFromBackend(user.id_user);
      setSpaceName('');
      setShowModal(false);

      Toast.show({
        type: 'success',
        text1: 'Sesión creada',
        text2: `La sesión "${trimmedName}" se creó correctamente`,
      });
    } catch (error: any) {
      console.error('Error al crear sesión:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al crear sesión',
        text2: error.response?.data?.detail || 'Ocurrió un error inesperado',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hola, {user?.username}</Text>
          <Text style={styles.subtitle}>Tus espacios de trabajo</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido: espacios */}
      <ScrollView style={styles.content}>
        {spaces.map((space: any) => (
          <TouchableOpacity
            key={space.id}
            style={styles.spaceCard}
            onPress={() => onNavigateToSpace(space.id)}
            activeOpacity={0.7}
          >
            <View style={styles.spaceCardContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.spaceName}>{space.name}</Text>
                <Text style={styles.spaceStats}>{space.pomodoros.length} pomodoros</Text>
              </View>
              <Text style={styles.spaceTime}>
                {formatTimeDetailed(space.total_focus_seconds + space.total_break_seconds)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {spaces.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No tienes espacios aún.{'\n'}¡Crea tu primer espacio de trabajo!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Flecha animada para primer espacio */}
      {spaces.length === 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 30,
            right: 100,
            transform: [{ translateY: arrowAnim }],
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#e81010ff',
              fontSize: 18,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            Crea tu primera sesión
          </Text>
          <Text
            style={{
              color: '#e53935',
              fontSize: 36,
              fontWeight: 'bold',
            }}
          >
            ─────▶
          </Text>
        </Animated.View>
      )}

      {/* Modal para crear nueva sesión */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Espacio</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la actividad (ej: Música, Deporte)"
              value={spaceName}
              onChangeText={setSpaceName}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setShowModal(false);
                  setSpaceName('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, !spaceName.trim() && styles.buttonDisabled]}
                onPress={handleCreateSpace}
                disabled={!spaceName.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Toast position="bottom" />
    </SafeAreaView>
  );
};

export default HomeScreen;

