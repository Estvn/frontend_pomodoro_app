import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SafeAreaView, StatusBar, Text, View, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import styles from '../styles';

export const PomodoroTimerScreen = ({ spaceId, pomodoroConfig, onFinish }: { spaceId: string; pomodoroConfig: { duration: number; breakTime: number }; onFinish: () => void }) => {
  const { spaces, updatePomodoro } = useApp();
  const space = spaces.find((s: any) => s.id === spaceId);
  const pomodoro = space?.pomodoros[space.pomodoros.length - 1];

  const [timeLeft, setTimeLeft] = useState(pomodoroConfig.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedWorkTime, setCompletedWorkTime] = useState(0);
  const completedWorkRef = useRef(completedWorkTime);

  useEffect(() => {
    completedWorkRef.current = completedWorkTime;
  }, [completedWorkTime]);

  const handleComplete = useCallback(() => {
    if (pomodoro) {
      updatePomodoro(spaceId, pomodoro.id, completedWorkRef.current, true);
    }
    onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, pomodoro?.id, updatePomodoro, onFinish]);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          if (!isBreak) {
            setCompletedWorkTime((c) => c + 1);
          }

          if (newTime === 0) {
            if (!isBreak) {
              // Terminó el trabajo, iniciar descanso
              if (pomodoroConfig.breakTime > 0) {
                setIsBreak(true);
                setIsRunning(false);
                return pomodoroConfig.breakTime * 60;
              } else {
                // No hay descanso, finalizar
                handleComplete();
                return 0;
              }
            } else {
              // Terminó el descanso
              handleComplete();
              return 0;
            }
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, pomodoroConfig.breakTime, handleComplete]);

  const handleStop = () => {
    if (pomodoro) {
      updatePomodoro(spaceId, pomodoro.id, completedWorkRef.current, true);
    }
    onFinish();
  };

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
            onPress={() => setIsRunning(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {timeLeft === pomodoroConfig.duration * 60 ? 'Iniciar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonLarge, styles.buttonWarning]}
            onPress={() => setIsRunning(false)}
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
    </SafeAreaView>
  );
};

export default PomodoroTimerScreen;
