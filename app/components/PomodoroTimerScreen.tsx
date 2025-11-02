import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { finalizarPausa, iniciarPausa } from '../../services/pausas';
import { actualizarPomodoroEnBackend } from '../../services/pomodoros';
import { useApp } from '../context/AppContext';
import styles from '../styles';

// ✅ Tipado explícito de props
interface PomodoroTimerScreenProps {
  spaceId: string;
  pomodoroConfig: { duration: number; breakTime: number };
  repetitions?: number;
  pomodoroId: number;
  onFinish: () => void;
}

// ✅ Nueva configuración compatible con Expo SDK 51+ (agrega shouldShowBanner y shouldShowList)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const PomodoroTimerScreen: React.FC<PomodoroTimerScreenProps> = ({
  spaceId,
  pomodoroConfig,
  repetitions = 1,
  pomodoroId,
  onFinish,
}) => {
  const { spaces, refreshPomodoros } = useApp();
  const space = spaces.find((s: any) => s.id === spaceId);

  const [timeLeft, setTimeLeft] = useState(pomodoroConfig.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pauseId, setPauseId] = useState<number | null>(null);
  const [completedWorkTime, setCompletedWorkTime] = useState(0);
  const [completedBreakTime, setCompletedBreakTime] = useState(0);
  const [repetitionsLeft, setRepetitionsLeft] = useState(repetitions);

  const completedWorkRef = useRef(completedWorkTime);
  const completedBreakRef = useRef(completedBreakTime);
  const soundRef = useRef<Audio.Sound | null>(null);

  // 🔊 Cargar el sonido al montar
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/alarm.mp3')
        );
        soundRef.current = sound;
      } catch (error) {
        console.error('Error al cargar sonido:', error);
      }
    };
    loadSound();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  // 🕹️ Reproducir sonido o vibrar según la plataforma
  const playSoundOrVibrate = async () => {
    try {
      if (Platform.OS === 'web') {
        // 🎵 Web: solo sonido
        if (soundRef.current) {
          await soundRef.current.replayAsync();
          setTimeout(async () => {
            if (soundRef.current) await soundRef.current.stopAsync();
          }, 3000);
        }
      } else {
        // 📱 Móvil: vibrar y notificación (incluso en segundo plano)
        Vibration.vibrate([500, 200, 500, 200, 500]);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '¡Tiempo completado!',
            body: isBreak ? 'El descanso ha terminado' : 'El pomodoro ha terminado',
            sound: true,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Error en playSoundOrVibrate:', error);
    }
  };

  useEffect(() => {
    completedWorkRef.current = completedWorkTime;
  }, [completedWorkTime]);

  useEffect(() => {
    completedBreakRef.current = completedBreakTime;
  }, [completedBreakTime]);

  const handleComplete = useCallback(async () => {
    if (space) {
      space.total_focus_seconds += completedWorkRef.current;
    }
    try {
      await actualizarPomodoroEnBackend(
        pomodoroId,
        true,
        completedWorkRef.current,
        completedBreakRef.current,
        repetitions,
        false
      );
    } catch (error) {
      console.error('Error al actualizar pomodoro:', error);
    }
    if (pauseId) {
      try {
        await finalizarPausa(pauseId);
        setPauseId(null);
      } catch (error) {
        console.error('Error al finalizar pausa activa:', error);
      }
    }
    onFinish();
    refreshPomodoros(spaceId);
  }, [onFinish, pauseId, space, repetitions, pomodoroId, spaceId, refreshPomodoros]);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          if (!isBreak) {
            setCompletedWorkTime((c) => c + 1);
          } else {
            setCompletedBreakTime((c) => c + 1);
          }

          if (newTime === 0) {
            playSoundOrVibrate();
            Alert.alert(
              isBreak ? '¡Descanso terminado!' : '¡Pomodoro completado!',
              isBreak ? 'Es hora de volver al trabajo' : '¡Buen trabajo!',
              [{ text: 'OK' }]
            );

            if (!isBreak) {
              if (repetitionsLeft > 1) {
                if (pomodoroConfig.breakTime > 0) {
                  setIsBreak(true);
                  setIsRunning(false);
                  setRepetitionsLeft((r) => r - 1);
                  return pomodoroConfig.breakTime * 60;
                } else {
                  setRepetitionsLeft((r) => r - 1);
                  return pomodoroConfig.duration * 60;
                }
              } else {
                handleComplete();
                return 0;
              }
            } else {
              setIsBreak(false);
              setIsRunning(false);
              return pomodoroConfig.duration * 60;
            }
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, pomodoroConfig.breakTime, handleComplete, pomodoroConfig.duration, repetitionsLeft]);

  const handleStop = useCallback(async () => {
    if (space) {
      space.total_focus_seconds += completedWorkRef.current;
    }
    try {
      await actualizarPomodoroEnBackend(
        pomodoroId,
        false,
        completedWorkRef.current,
        completedBreakRef.current,
        repetitions,
        true
      );
    } catch (error) {
      console.error('Error al actualizar pomodoro:', error);
    }
    if (pauseId) {
      try {
        await finalizarPausa(pauseId);
        setPauseId(null);
      } catch (error) {
        console.error('Error al finalizar pausa activa:', error);
      }
    }
    refreshPomodoros(spaceId);
    onFinish();
  }, [onFinish, pauseId, space, repetitions, pomodoroId, spaceId, refreshPomodoros]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? (pomodoroConfig.breakTime * 60 - timeLeft) / (pomodoroConfig.breakTime * 60)
    : (pomodoroConfig.duration * 60 - timeLeft) / (pomodoroConfig.duration * 60);

  return (
    <SafeAreaView style={[styles.container, styles.timerContainer]}>
      <StatusBar barStyle="light-content" />

      {/* Luego el nombre del espacio */}
      <Text style={styles.timerTitle}>{space?.name}</Text>

      {/* Y debajo el estado actual */}
      <Text style={styles.timerPhase}>{isBreak ? '☕ Descanso' : '🍅 Enfócate'}</Text>

      {/* 🔁 Repeticiones más arriba */}
      <Text style={styles.repetitionsText}>
        ({repetitionsLeft}/{repetitions})
      </Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.timerControls}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonLarge]}
            onPress={async () => {
              if (pauseId) {
                await finalizarPausa(pauseId);
                setPauseId(null);
              }
              if (timeLeft === 0) {
                setTimeLeft(pomodoroConfig.duration * 60);
                setRepetitionsLeft(repetitions);
                setCompletedWorkTime(0);
              }
              setIsRunning(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {timeLeft === pomodoroConfig.duration * 60 ? 'Iniciar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonLarge, styles.buttonWarning]}
            onPress={async () => {
              if (pauseId === null) {
                setIsRunning(false);
                const id = await iniciarPausa(pomodoroId);
                setPauseId(id);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Pausar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonLarge, styles.buttonDanger]}
          onPress={handleStop}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.timerInfo}>
        Tiempo de trabajo: {Math.floor(completedWorkTime / 60)}m {completedWorkTime % 60}s
      </Text>
      <Text style={styles.timerInfo}>
        Tiempo de descanso: {Math.floor(completedBreakTime / 60)}m {completedBreakTime % 60}s
      </Text>
    </SafeAreaView>
  );

};

export default PomodoroTimerScreen;