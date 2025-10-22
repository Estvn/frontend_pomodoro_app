import React, { useEffect, useState } from 'react';
import { HomeScreen } from '../components/HomeScreen';
import { PomodoroTimerScreen } from '../components/PomodoroTimerScreen';
import { SignInScreen } from '../components/SignInScreen';
import { SignUpScreen } from '../components/SignUpScreen';
import { SpaceDetailScreen } from '../components/SpaceDetailScreen';
import { useApp } from '../context/AppContext';

const App = () => {
    const [currentScreen, setCurrentScreen] = useState<'signIn' | 'signUp' | 'home' | 'spaceDetail' | 'pomodoro' | null>(null);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
    const [pomodoroConfig, setPomodoroConfig] = useState<{ duration: number; breakTime: number } | null>(null);
    const { user } = useApp();

    useEffect(() => {
        if (user) {
            setCurrentScreen('home');
        } else {
            setCurrentScreen('signIn');
        }
    }, [user]);

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

    if (!currentScreen) return null;

    return (
        <>
            {currentScreen === 'signIn' && (
                <SignInScreen
                    toHome={navigateToHome}
                    onSwitchToSignUp={() => setCurrentScreen('signUp')}
                />
            )}

            {currentScreen === 'signUp' && (
                <SignUpScreen
                    toHome={navigateToHome}
                    onSwitchToSignIn={() => setCurrentScreen('signIn')}
                />
            )}
            {currentScreen === 'home' && <HomeScreen onNavigateToSpace={navigateToSpace} />}
            {currentScreen === 'spaceDetail' && selectedSpaceId && (
                <SpaceDetailScreen spaceId={selectedSpaceId} onBack={navigateToHome} onStartPomodoro={navigateToPomodoro} />
            )}
            {currentScreen === 'pomodoro' && selectedSpaceId && pomodoroConfig && (
                <PomodoroTimerScreen spaceId={selectedSpaceId} pomodoroConfig={pomodoroConfig} onFinish={() => navigateToSpace(selectedSpaceId)} />
            )}
        </>
    );
};

export default App;
