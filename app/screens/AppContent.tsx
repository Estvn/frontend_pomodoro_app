import React, { useEffect, useState } from 'react';
import { iniciarPomodoroEnBackend } from '../../services/pomodoros';
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
    const { user, addPomodoro } = useApp();

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

    const navigateToPomodoro = async (
        spaceId: string,
        duration: number,
        breakTime: number,
        ruleId: string,
        typeId: string
    ) => {

        try {
            const backendId = await iniciarPomodoroEnBackend({
                id_session: parseInt(spaceId),
                id_pomodoro_rule: parseInt(ruleId),
                id_pomodoro_type: parseInt(typeId),
                planned_duration: duration,
            });

            addPomodoro(
                spaceId,
                duration,
                breakTime,
                backendId.toString(),
                parseInt(ruleId),
                parseInt(typeId)
            );
            setPomodoroConfig({ duration, breakTime });
            setSelectedSpaceId(spaceId);
            setCurrentScreen('pomodoro');
        } catch (error) {
            console.error('Error al iniciar pomodoro en backend:', error);
        }

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
                <SpaceDetailScreen
                    spaceId={selectedSpaceId}
                    onBack={navigateToHome}
                    onStartPomodoro={(spaceId, duration, breakTime, ruleId, typeId) => {
                        void navigateToPomodoro(spaceId, duration, breakTime, ruleId, typeId);
                    }}

                />
            )}

            {currentScreen === 'pomodoro' && selectedSpaceId && pomodoroConfig && (
                <PomodoroTimerScreen spaceId={selectedSpaceId} pomodoroConfig={pomodoroConfig} onFinish={() => navigateToSpace(selectedSpaceId)} />
            )}
        </>
    );
};

export default App;
