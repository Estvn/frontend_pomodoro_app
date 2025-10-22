import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AppContextType = any;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [spaces, setSpaces] = useState<any[]>([]);

  useEffect(() => {
    const cargarSesion = async () => {
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      if (usuarioGuardado) {
        setUser(JSON.parse(usuarioGuardado)); // ✅ restaura sesión
      }
    };
    cargarSesion();
  }, []);


  const login = async (username: string) => {
    const usuario = { username };
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
    setUser(usuario);
  };


  const logout = async () => {
    await AsyncStorage.removeItem('usuario');
    setUser(null);
  };

  const createSpace = (name: string) => {
    const newSpace = {
      id: Date.now().toString(),
      name,
      pomodoros: [],
      totalTime: 0,
    };
    setSpaces((s) => [...s, newSpace]);
    return newSpace.id;
  };

  const addPomodoro = (spaceId: string, duration: number, breakTime: number) => {
    setSpaces((curr) =>
      curr.map((space) => {
        if (space.id === spaceId) {
          const newPomodoro = {
            id: Date.now().toString(),
            duration: duration * 60,
            breakTime: breakTime * 60,
            completedTime: 0,
            startTime: new Date(),
            endTime: null,
            completed: false,
          };
          return {
            ...space,
            pomodoros: [...space.pomodoros, newPomodoro],
          };
        }
        return space;
      })
    );
  };

  const updatePomodoro = (
    spaceId: string,
    pomodoroId: string,
    completedTime: number,
    completed: boolean
  ) => {
    setSpaces((curr) =>
      curr.map((space) => {
        if (space.id === spaceId) {
          const updatedPomodoros = space.pomodoros.map((pomodoro: any) => {
            if (pomodoro.id === pomodoroId) {
              return {
                ...pomodoro,
                completedTime,
                completed,
                endTime: completed ? new Date() : null,
              };
            }
            return pomodoro;
          });

          const totalTime = updatedPomodoros.reduce(
            (sum: number, p: any) => sum + p.completedTime,
            0
          );

          return {
            ...space,
            pomodoros: updatedPomodoros,
            totalTime,
          };
        }
        return space;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{ user, spaces, login, logout, createSpace, addPomodoro, updatePomodoro }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;
