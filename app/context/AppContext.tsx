import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { listarPomodorosPorSesion } from '../../services/pomodoros';
import { listarSesiones } from '../../services/sesiones';


type AppContextType = {
  user: { id_user: number; username: string } | null;
  spaces: SpaceType[];
  login: (id_user: number, username: string) => Promise<void>;
  logout: () => Promise<void>;
  createSpace: (space: SpaceType) => string | number;
  addPomodoro: (
    spaceId: string,
    duration: number,
    breakTime: number,
    backendId: string,
    ruleId: number,
    typeId: number
  ) => void;
  updatePomodoro: (
    spaceId: string,
    pomodoroId: string,
    completedTime: number,
    completed: boolean
  ) => void;
  loadSpacesFromBackend: (id_user: number) => Promise<void>;
};

type SpaceType = {
  id: string | number;
  name: string;
  pomodoros: PomodoroType[];
  totalTime: number;
  totalPauseMinutes: number;
};

type PomodoroType = {
  id: string;
  duration: number;
  breakTime: number;
  completedTime: number;
  startTime: Date;
  endTime: Date | null;
  completed: boolean;
  ruleId: number;
  typeId: number;
};


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [spaces, setSpaces] = useState<SpaceType[]>([]);

  useEffect(() => {
    const cargarSesion = async () => {
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        setUser(usuario);
        await loadSpacesFromBackend(usuario.id_user);
      }
    };
    cargarSesion();
  }, []);


  const login = async (id_user: number, username: string) => {
    try {
      const usuario = { id_user, username };
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      setUser(usuario);
      await loadSpacesFromBackend(id_user);

    } catch (error) {
      console.error('Error el login:', error);
    }
  };


  const logout = async () => {
    await AsyncStorage.removeItem('usuario');
    setUser(null);
  };

  const createSpace = (space: SpaceType) => {
    setSpaces((s) => {
      if (s.some((existing) => existing.id === space.id)) {
        return s;
      }
      return [...s, space];
    });
    return space.id;
  };


  const loadSpacesFromBackend = async (id_user: number) => {
    try {
      const sesiones = await listarSesiones(id_user);

      const spacesFormateados = await Promise.all(
        sesiones.map(async (s) => {
          const pomodorosRaw = await listarPomodorosPorSesion(s.id_session);
          const pomodoros = pomodorosRaw.map((p: any) => ({
            id: String(p.id_pomodoro_detail),
            duration: p.planned_duration ?? 0,
            breakTime: p.break_duration ?? 0,
            completedTime: p.completed_time ?? 0,
            startTime: new Date(p.start_time),
            endTime: p.end_time ? new Date(p.end_time) : null,
            completed: p.is_completed ?? false,
            ruleId: p.id_pomodoro_rule,
            typeId: p.id_pomodoro_type,
          }));

          return {
            id: s.id_session,
            name: s.session_name,
            pomodoros: pomodoros || [],
            totalTime: s.total_focus_minutes || 0,
            totalPauseMinutes: s.total_pause_minutes || 0,
          };
        })
      );

      setSpaces(spacesFormateados);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    }
  };

  const addPomodoro = (
    spaceId: string,
    duration: number,
    breakTime: number,
    backendId: string,
    ruleId: number,
    typeId: number
  ) => {
    setSpaces((curr) =>
      curr.map((space) => {
        if (space.id === spaceId) {
          const newPomodoro = {
            id: backendId,
            duration: duration * 60,
            breakTime: breakTime * 60,
            completedTime: 0,
            startTime: new Date(),
            endTime: null,
            completed: false,
            ruleId,
            typeId,
          };

          console.log(newPomodoro)
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
      value={{
        user,
        spaces,
        login,
        logout,
        createSpace,
        addPomodoro,
        updatePomodoro,
        loadSpacesFromBackend,
      }}
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
