import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import { SignInScreen } from '../components/SignInScreen';
import { HomeScreen } from '../components/HomeScreen';
import { SpaceDetailScreen } from '../components/SpaceDetailScreen';
import { PomodoroTimerScreen } from '../components/PomodoroTimerScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<'signIn' | 'home' | 'spaceDetail' | 'pomodoro'>('signIn');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [pomodoroConfig, setPomodoroConfig] = useState<{ duration: number; breakTime: number } | null>(null);

  const navigateToHome = () => {
    setCurrentScreen('home');
    setSelectedSpaceId(null);
  };

  const navigateToSpace = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setCurrentScreen('spaceDetail');
  };

  const navigateToPomodoro = (spaceId: string, duration: number, breakTime: number) => {
    setPomodoroConfig({ duration, breakTime });
    setSelectedSpaceId(spaceId);
    setCurrentScreen('pomodoro');
  };

  return (
    <AppProvider>
      {currentScreen === 'signIn' && <SignInScreen onSignIn={navigateToHome} />}
      {currentScreen === 'home' && <HomeScreen onNavigateToSpace={navigateToSpace} />}
      {currentScreen === 'spaceDetail' && selectedSpaceId && (
        <SpaceDetailScreen spaceId={selectedSpaceId} onBack={navigateToHome} onStartPomodoro={navigateToPomodoro} />
      )}
      {currentScreen === 'pomodoro' && selectedSpaceId && pomodoroConfig && (
        <PomodoroTimerScreen spaceId={selectedSpaceId} pomodoroConfig={pomodoroConfig} onFinish={() => navigateToSpace(selectedSpaceId)} />
      )}
    </AppProvider>
  );
};

export default App;