import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { finalizarPausa, iniciarPausa } from '../../services/pausas';
import { actualizarPomodoroEnBackend } from '../../services/pomodoros';
import { useApp } from '../context/AppContext';
import styles from '../styles';

interface PomodoroTimerScreenProps {
  spaceId: string;
  pomodoroConfig: { duration: number; breakTime: number };
  repetitions?: number;
  pomodoroId: number;
  onFinish: () => void;
}

// Configuración de notificaciones SOLO para móvil
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

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
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<string>(AppState.currentState);
  const timerDataRef = useRef({
    timeLeft,
    isRunning,
    isBreak,
    endTime: endTimeRef.current,
    pomodoroConfig
  });

  // Actualizar ref cuando cambie el estado
  useEffect(() => {
    timerDataRef.current = {
      timeLeft,
      isRunning,
      isBreak,
      endTime: endTimeRef.current,
      pomodoroConfig
    };
  }, [timeLeft, isRunning, isBreak, pomodoroConfig]);

  // 🔊 Cargar sonido
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/alarm.mp3')
        );
        soundRef.current = sound;
        setIsSoundLoaded(true);
      } catch (error) {
        console.error('Error al cargar sonido:', error);
        setIsSoundLoaded(false);
      }
    };
    
    loadSound();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (soundRef.current && isSoundLoaded) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // 🔔 Reproducir sonido o vibrar
  const playSoundOrVibrate = async () => {
    try {
      if (Platform.OS !== 'web') Vibration.vibrate([500, 200, 500, 200, 500]);
      if (soundRef.current && isSoundLoaded) {
        await soundRef.current.replayAsync();
        setTimeout(() => soundRef.current?.stopAsync(), 3000);
      }
    } catch (error) {
      console.error('Error en playSoundOrVibrate:', error);
    }
  };

  // 🏁 Completar Pomodoro
  const handleComplete = useCallback(async () => {
    if (space) space.total_focus_seconds += completedWorkTime;

    try {
      await actualizarPomodoroEnBackend(pomodoroId, true, completedWorkTime, completedBreakTime, repetitions, false);
    } catch (error) {
      console.error(error);
    }

    if (pauseId) {
      try { await finalizarPausa(pauseId); setPauseId(null); } catch {} 
    }

    if (Platform.OS !== 'web') {
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    onFinish();
    refreshPomodoros(spaceId);
  }, [completedWorkTime, completedBreakTime, pauseId, space, repetitions, pomodoroId, spaceId, refreshPomodoros, onFinish]);

  // ⏰ Manejar fin del temporizador
  const handleTimerEnd = useCallback(async () => {
    await playSoundOrVibrate();
    
    // Limpiar notificaciones programadas
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    Alert.alert(
      isBreak ? 'Descanso terminado' : 'Pomodoro completado',
      isBreak ? 'Es hora de volver al trabajo' : '¡Buen trabajo!',
      [{ text: 'OK' }]
    );

    if (!isBreak) {
      if (repetitionsLeft > 1 && pomodoroConfig.breakTime > 0) {
        setIsBreak(true);
        setRepetitionsLeft(r => r - 1);
        setTimeLeft(pomodoroConfig.breakTime * 60);
      } else if (repetitionsLeft > 1) {
        setRepetitionsLeft(r => r - 1);
        setTimeLeft(pomodoroConfig.duration * 60);
      } else {
        handleComplete();
      }
    } else {
      setIsBreak(false);
      setTimeLeft(pomodoroConfig.duration * 60);
    }
  }, [isBreak, repetitionsLeft, pomodoroConfig, handleComplete]);

  // 🎯 Función para calcular tiempo restante basado en timestamp
  const calculateRemainingTime = useCallback(() => {
    if (!endTimeRef.current) return 0;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
    return remaining;
  }, []);

  // 🔔 Programar notificación de finalización
  const scheduleCompletionNotification = useCallback(async () => {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isBreak ? 'Descanso terminado' : 'Pomodoro completado',
          body: isBreak ? 'Es hora de volver al trabajo' : '¡Buen trabajo!',
          sound: true,
        },
        trigger: {
          type: 'timeInterval',
          seconds: timeLeft,
          repeats: false,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch (error) {
      console.error('Error programando notificación:', error);
    }
  }, [isBreak, timeLeft]);

  // ⏱ Iniciar temporizador
  const startTimer = useCallback(() => {
    const totalSeconds = isBreak ? pomodoroConfig.breakTime * 60 : pomodoroConfig.duration * 60;
    startTimeRef.current = Date.now();
    endTimeRef.current = startTimeRef.current + timeLeft * 1000;
    setIsRunning(true);

    // Programar notificación de finalización
    if (Platform.OS !== 'web') {
      scheduleCompletionNotification();
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const remaining = calculateRemainingTime();
      setTimeLeft(remaining);

      if (!isBreak) setCompletedWorkTime(c => c + 1);
      else setCompletedBreakTime(c => c + 1);

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        handleTimerEnd();
      }
    }, 1000);
  }, [isBreak, timeLeft, pomodoroConfig, calculateRemainingTime, handleTimerEnd, scheduleCompletionNotification]);

  // 🔄 Manejar cambios en el estado de la app (Background/Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      // Cuando la app vuelve a primer plano
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        timerDataRef.current.isRunning
      ) {
        // Recalcular tiempo restante basado en el timestamp
        const remaining = calculateRemainingTime();
        setTimeLeft(remaining);
        
        // Si el tiempo se acabó mientras estaba en background
        if (remaining <= 0) {
          handleTimerEnd();
        } else {
          // Re-programar notificación con el tiempo actualizado
          if (Platform.OS !== 'web') {
            scheduleCompletionNotification();
          }
        }
      }
      
      // Cuando la app va a segundo plano
      if (nextAppState === 'background' && timerDataRef.current.isRunning) {
        console.log('App en segundo plano - temporizador sigue corriendo');
      }

      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [calculateRemainingTime, handleTimerEnd, scheduleCompletionNotification]);

  // ⏱ Control del temporizador principal
  useEffect(() => {
    if (isRunning) {
      startTimer();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Cancelar notificaciones cuando se pausa
      if (Platform.OS !== 'web') {
        Notifications.cancelAllScheduledNotificationsAsync();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTimer]);

  const handleStop = useCallback(async () => {
    if (space) space.total_focus_seconds += completedWorkTime;
    try {
      await actualizarPomodoroEnBackend(pomodoroId, false, completedWorkTime, completedBreakTime, repetitions, true);
    } catch {}
    if (pauseId) { 
      try { await finalizarPausa(pauseId); setPauseId(null); } catch {} 
    }
    
    // Cancelar todas las notificaciones
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    refreshPomodoros(spaceId); 
    onFinish();
  }, [completedWorkTime, completedBreakTime, pauseId, space, repetitions, pomodoroId, spaceId, refreshPomodoros, onFinish]);

  const formatTime = (seconds: number) => 
    `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  
  const progress = isBreak ? 
    (pomodoroConfig.breakTime*60 - timeLeft)/(pomodoroConfig.breakTime*60) : 
    (pomodoroConfig.duration*60 - timeLeft)/(pomodoroConfig.duration*60);

  return (
    <SafeAreaView style={[styles.container, styles.timerContainer]}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.timerTitle}>{space?.name}</Text>
      <Text style={styles.timerPhase}>{isBreak ? '☕ Descanso' : '🍅 Enfócate'}</Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress*100}%` }]} />
      </View>

      <View style={styles.timerControls}>
        {!isRunning ? (
          <TouchableOpacity 
            style={[styles.button, styles.buttonLarge]} 
            onPress={() => setIsRunning(true)} 
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {timeLeft === (isBreak ? pomodoroConfig.breakTime*60 : pomodoroConfig.duration*60) ? 'Iniciar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.buttonLarge, styles.buttonWarning]} 
            onPress={async () => { 
              setIsRunning(false); 
              const id = await iniciarPausa(pomodoroId); 
              setPauseId(id); 
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
        Tiempo de trabajo: {Math.floor(completedWorkTime/60)}m {completedWorkTime%60}s
      </Text>
      <Text style={styles.timerInfo}>
        Tiempo de descanso: {Math.floor(completedBreakTime/60)}m {completedBreakTime%60}s
      </Text>
      <Text style={styles.timerInfo}>
        Repeticiones restantes: {repetitionsLeft}
      </Text>
    </SafeAreaView>
  );
};

export default PomodoroTimerScreen;