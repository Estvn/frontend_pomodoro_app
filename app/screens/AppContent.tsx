import React, { useEffect, useState } from 'react';
import { crearPomodoroEnBackend } from '../../services/pomodoros';
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
    const [repetitions, setRepetitions] = useState<number>(1);
    const [pomodoroId, setPomodoroId] = useState<number | null>(null);
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

    const navigateToPomodoro = async (
        spaceId: string,
        duration: number,
        breakTime: number,
        ruleId: string,
        typeId: string,
        repetitions: number
    ) => {
        try {
            const response = await crearPomodoroEnBackend({
                id_session: parseInt(spaceId),
                id_pomodoro_rule: parseInt(ruleId),
                id_pomodoro_type: parseInt(typeId),
                event_type: 'focus',
                planned_duration: duration * repetitions + (repetitions - 1) * breakTime,
                is_completed: false,
                notes: null,
            });

            setPomodoroId(response.id_pomodoro_detail);
            setPomodoroConfig({ duration, breakTime });
            setRepetitions(repetitions);
            setSelectedSpaceId(spaceId);
            setCurrentScreen('pomodoro');
        } catch (error) {
            console.error('Error al crear pomodoro:', error);
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
                    onStartPomodoro={(spaceId, duration, breakTime, ruleId, typeId, repetitions) => {
                        void navigateToPomodoro(spaceId, duration, breakTime, ruleId, typeId, repetitions);
                    }}
                />

            )}

            {currentScreen === 'pomodoro' && selectedSpaceId && pomodoroConfig && pomodoroId !== null && (
                <PomodoroTimerScreen
                    spaceId={selectedSpaceId}
                    pomodoroConfig={pomodoroConfig}
                    repetitions={repetitions}
                    pomodoroId={pomodoroId}
                    onFinish={() => navigateToSpace(selectedSpaceId)}
                />
            )}
        </>
    );
};

export default App;
