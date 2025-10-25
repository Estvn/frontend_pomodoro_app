import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { finalizarPausa, iniciarPausa } from '../../services/pausas';
import { actualizarPomodoroEnBackend } from '../../services/pomodoros';
import { useApp } from '../context/AppContext';
import styles from '../styles';


export const PomodoroTimerScreen = ({
  spaceId,
  pomodoroConfig,
  repetitions = 1,
  pomodoroId,
  onFinish,
}: {
  spaceId: string;
  pomodoroConfig: { duration: number; breakTime: number };
  repetitions?: number;
  pomodoroId: number;
  onFinish: () => void;
}) => {

  const { spaces } = useApp();
  const { refreshPomodoros } = useApp();
  const space = spaces.find((s: any) => s.id === spaceId);
  const [timeLeft, setTimeLeft] = useState(pomodoroConfig.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pauseId, setPauseId] = useState<number | null>(null);
  const [completedWorkTime, setCompletedWorkTime] = useState(0);
  const completedWorkRef = useRef(completedWorkTime);
  const [repetitionsLeft, setRepetitionsLeft] = useState(repetitions);
  const [completedBreakTime, setCompletedBreakTime] = useState(0);
  const completedBreakRef = useRef(completedBreakTime);

  useEffect(() => {
    completedBreakRef.current = completedBreakTime;
  }, [completedBreakTime]);

  useEffect(() => {
    completedWorkRef.current = completedWorkTime;
  }, [completedWorkTime]);

  // Funcion que se encarga de finalizar el pomodoro
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

  // Funcion para interrumpir el pomodoro
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

  // Funcion convierte una cantidad de segundos en formato de horas y minutos
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Funcion para calcular el progreso del pomodoro
  const progress = isBreak
    ? (pomodoroConfig.breakTime * 60 - timeLeft) / (pomodoroConfig.breakTime * 60)
    : (pomodoroConfig.duration * 60 - timeLeft) / (pomodoroConfig.duration * 60);

  return (
    <SafeAreaView style={[styles.container, styles.timerContainer]}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.timerTitle}>{space?.name}</Text>
      <Text style={styles.timerPhase}>{isBreak ? '☕ Descanso' : '🍅 Enfócate'}</Text>

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
