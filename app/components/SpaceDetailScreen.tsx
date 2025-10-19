import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import styles from '../styles';
import { formatTimeDetailed, formatDate } from '../utils/helpers';

export const SpaceDetailScreen = ({ spaceId, onBack, onStartPomodoro }: { spaceId: string; onBack: () => void; onStartPomodoro: (spaceId: string, duration: number, breakTime: number) => void }) => {
  const { spaces } = useApp();
  const space = spaces.find((s: any) => s.id === spaceId);
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState('25');
  const [breakTime, setBreakTime] = useState('5');

  if (!space) return null;

  const handleStartPomodoro = () => {
    const durationNum = parseInt(duration);
    const breakNum = parseInt(breakTime);

    if (durationNum > 0 && breakNum >= 0) {
      onStartPomodoro(spaceId, durationNum, breakNum);
      setShowModal(false);
      setDuration('25');
      setBreakTime('5');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{space.name}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{space.pomodoros.length}</Text>
            <Text style={styles.statLabel}>Pomodoros</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTimeDetailed(space.totalTime)}</Text>
            <Text style={styles.statLabel}>Tiempo Total</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historial</Text>

        <ScrollView style={styles.historyList}>
      {space.pomodoros
        .slice()
        .reverse()
        .map((pomodoro: any) => (
              <View key={pomodoro.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyStatus}>
                    {pomodoro.completed ? '✓ Completado' : '⏱ En progreso'}
                  </Text>
                  <Text style={styles.historyTime}>{formatTimeDetailed(pomodoro.completedTime)}</Text>
                </View>
                <Text style={styles.historyDate}>{formatDate(pomodoro.startTime)}</Text>
                <Text style={styles.historyDetails}>
                  Duración: {Math.floor(pomodoro.duration / 60)}m • Descanso: {Math.floor(pomodoro.breakTime / 60)}m
                </Text>
              </View>
            ))}

          {space.pomodoros.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No hay pomodoros aún.{'\n'}¡Comienza tu primera sesión!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>▶</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Sesión Pomodoro</Text>

            <Text style={styles.label}>Duración (minutos)</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Descanso (minutos)</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              value={breakTime}
              onChangeText={setBreakTime}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleStartPomodoro} activeOpacity={0.7}>
                <Text style={styles.buttonText}>Iniciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SpaceDetailScreen;
