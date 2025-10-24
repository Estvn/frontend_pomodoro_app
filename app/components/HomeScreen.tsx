import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { crearSesion } from '../../services/sesiones';
import { useApp } from '../context/AppContext';
import styles from '../styles';
import { formatTimeForHome } from '../utils/helpers';


export const HomeScreen = ({ onNavigateToSpace }: { onNavigateToSpace: (id: string) => void }) => {
  const { user, spaces, logout, loadSpacesFromBackend } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [spaceName, setSpaceName] = useState('');

  const handleCreateSpace = async () => {
    if (!spaceName.trim() || !user) return;

    try {
      await crearSesion(user.id_user, spaceName.trim());
      await loadSpacesFromBackend(user.id_user); // ✅ recarga desde el backend

      setSpaceName('');
      setShowModal(false);
    } catch (error: any) {
      console.error('Error al crear sesión:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hola, {user?.username}</Text>
          <Text style={styles.subtitle}>Tus espacios de trabajo</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {spaces.map((space: any) => (
          <TouchableOpacity
            key={space.id}
            style={styles.spaceCard}
            onPress={() => onNavigateToSpace(space.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.spaceName}>{space.name}</Text>
            <Text style={styles.spaceStats}>
              {space.pomodoros.length} pomodoros • {formatTimeForHome(space.totalTime)}
            </Text>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
                style={[
                  styles.button,
                  !spaceName.trim() && styles.buttonDisabled,
                ]}
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
    </SafeAreaView>
  );
};

export default HomeScreen;
