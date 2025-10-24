import { getPomodoroRules, getPomodoroTypes, PomodoroRule, PomodoroType } from '@/services/pomodoros';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import styles from '../styles';
import { formatDate, formatTimeDetailed } from '../utils/helpers';


export const SpaceDetailScreen = ({
  spaceId,
  onBack,
  onStartPomodoro,
}: {
  spaceId: string;
  onBack: () => void;
  onStartPomodoro: (
    spaceId: string,
    duration: number,
    breakTime: number,
    ruleId: string,
    typeId: string
  ) => void;
}) => {

  const { spaces } = useApp();
  const space = spaces.find((s: any) => s.id === spaceId);
  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState('25');
  const [breakTime, setBreakTime] = useState('5');
  const [rules, setRules] = useState<PomodoroRule[]>([]);
  const [types, setTypes] = useState<PomodoroType[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');



  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const reglas = await getPomodoroRules();
        const tipos = await getPomodoroTypes();
        setRules(reglas);
        setTypes(tipos);
        if (reglas.length > 0) setSelectedRuleId(reglas[0].id_pomodoro_rule.toString());
        if (tipos.length > 0) setSelectedTypeId(tipos[0].id_pomodoro_type.toString());
      } catch (error) {
        console.error('Error al cargar reglas o tipos:', error);
      }
    };
    fetchOptions();
  }, []);



  if (!space) return null;

  const handleStartPomodoro = () => {
    const durationNum = parseInt(duration);
    const breakNum = parseInt(breakTime);

    if (durationNum > 0 && breakNum >= 0) {
      onStartPomodoro(spaceId, durationNum, breakNum, selectedRuleId, selectedTypeId);
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
                    {pomodoro.completed ? '✅ Completado' : '⛔ Interrumpido'}
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



            <Text style={styles.label}>Regla Pomodoro</Text>
            <View >
              <Picker
                selectedValue={selectedRuleId}
                onValueChange={(itemValue) => setSelectedRuleId(itemValue)}
                style={styles.input}
              >
                {rules.map((rule) => (
                  <Picker.Item
                    key={rule.id_pomodoro_rule}
                    label={`${rule.difficulty_level} (${rule.focus_duration}m/${rule.break_duration}m)`}
                    value={rule.id_pomodoro_rule.toString()}
                  />
                ))}
              </Picker>
            </View>
            {selectedRuleId && (
              <Text style={styles.helperText}>
                {rules.find((r) => r.id_pomodoro_rule.toString() === selectedRuleId)?.description}
              </Text>
            )}

            <Text style={styles.label}>Tipo Pomodoro</Text>
            <View >
              <Picker
                selectedValue={selectedTypeId}
                onValueChange={(itemValue) => setSelectedTypeId(itemValue)}
                style={styles.input}
              >
                {types.map((type) => (
                  <Picker.Item
                    key={type.id_pomodoro_type}
                    label={type.name_type}
                    value={type.id_pomodoro_type.toString()}
                  />
                ))}
              </Picker>
            </View>

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
