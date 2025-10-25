import { getPomodoroRules, getPomodoroTypes, PomodoroRule, PomodoroType } from '@/services/pomodoros';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import styles from '../styles';
import { formatTimeDetailed } from '../utils/helpers';

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
    typeId: string,
    repetitions: number
  ) => void;
}) => {
  const { spaces } = useApp();
  const space = spaces.find((s: any) => s.id === spaceId);
  const [showModal, setShowModal] = useState(false);
  const [repetitions, setRepetitions] = useState('2');;
  const [rules, setRules] = useState<PomodoroRule[]>([]);
  const [types, setTypes] = useState<PomodoroType[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Funcion para convertir segundos en horas y minutos
  const formatSecondsToHours = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 60);
    const minutes = Math.floor((totalSeconds % 60));

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  useEffect(() => {
    const rule = rules.find((r) => r.id_pomodoro_rule.toString() === selectedRuleId);
    const reps = parseInt(repetitions);
    if (rule && reps > 0) {
      const total = reps * rule.focus_duration + (reps - 1) * rule.break_duration;
      setEstimatedTime(total);
    } else {
      setEstimatedTime(0);
    }
  }, [selectedRuleId, repetitions, rules]);

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

  // Funcion para manejar el inicio de un pomodoro
  const handleStartPomodoro = () => {
    const reps = parseInt(repetitions);
    const rule = rules.find((r) => r.id_pomodoro_rule.toString() === selectedRuleId);
    if (rule && reps > 0 && rule.break_duration >= 0) {
      onStartPomodoro(
        spaceId,
        rule.focus_duration,
        rule.break_duration,
        selectedRuleId,
        selectedTypeId,
        reps
      );
      setShowModal(false);
      setRepetitions('2');
    }
  };

  // Funcion para parsear las notas (extrar las repeticiones de "notes")
  const parseNotes = (notes: string | null) => {
    try {
      if (!notes) return { repeticiones: 0 };
      const match = notes.match(/repeticiones=(\d+)/);
      return { repeticiones: match ? parseInt(match[1]) : 0 };
    } catch {
      return { repeticiones: 0 };
    }
  };

  // Formatea fechas para mostrarlas en la interfaz
  const parseDate = (raw: any) => {
    if (!raw) return null;
    const fecha = new Date(raw);
    if (isNaN(fecha.getTime())) return null;
    return fecha.toLocaleString('es-HN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <Text style={styles.statValue}>
              {formatTimeDetailed(space.total_focus_seconds + space.total_break_seconds)}
            </Text>

            <Text style={styles.statLabel}>Tiempo Total</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historial</Text>

        <ScrollView style={styles.historyList}>
          {space.pomodoros
            .slice()
            .reverse()
            .map((pomodoro: any) => {
              const { repeticiones } = parseNotes(pomodoro.notes || '');
              return (
                <View key={pomodoro.id_pomodoro_detail} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyStatus}>
                      {pomodoro.completed ? '✅ Completado' : '⛔ Interrumpido'}
                    </Text>
                    {/* <Text style={styles.historyTime}>
                      {typeof pomodoro.focusTime === 'number'
                        ? `${Math.floor(pomodoro.focusTime / 60)}m ${pomodoro.focusTime % 60}s`
                        : 'Tiempo no disponible'}
                    </Text> */}
                    <Text style={styles.historyTime}>
                      {(() => {
                        const rule = rules.find(r => r.id_pomodoro_rule === pomodoro.ruleId);
                        return rule
                          ? `(${rule.focus_duration}m/${rule.break_duration}m)`
                          : 'Regla no disponible';
                      })()}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {parseDate(pomodoro.created_date) || 'Fecha no disponible'}
                  </Text>
                  <Text style={styles.historyDetails}>
                    Repeticiones: {repeticiones}  |  Enfoque: {typeof pomodoro.focusTime === 'number' ? formatTimeDetailed(pomodoro.focusTime) : '—'}  |  Descanso: {typeof pomodoro.breakTime === 'number' ? formatTimeDetailed(pomodoro.breakTime) : '—'}
                  </Text>
                </View>
              );
            })}
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

            <Text style={styles.label}>Repeticiones</Text>
            <TextInput
              style={styles.input}
              placeholder="4"
              value={repetitions}
              onChangeText={setRepetitions}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Tiempo Estimado</Text>

            <Text style={[styles.input, { color: '#333', paddingVertical: 12 }]}>
              {estimatedTime} minutos {estimatedTime > 60 && ` (${formatSecondsToHours(estimatedTime)})`}
            </Text>

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
