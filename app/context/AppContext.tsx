import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { listarPomodorosPorSesion } from '../../services/pomodoros';
import { listarSesiones } from '../../services/sesiones';


type AppContextType = {
  user: { id_user: number; username: string } | null;
  refreshPomodoros: (spaceId: string) => Promise<void>;
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
    focusTime: number,
    breakTime: number,
    completed: boolean
  ) => void;

  loadSpacesFromBackend: (id_user: number) => Promise<void>;
};

type SpaceType = {
  id: string | number;
  name: string;
  pomodoros: PomodoroType[];
  total_focus_seconds: number;
  total_break_seconds: number;
  total_pause_seconds: number;
};

type PomodoroType = {
  id: string;
  duration: number;
  focusTime: number;
  breakTime: number;
  startTime: Date;
  endTime: Date | null;
  completed: boolean;
  ruleId: number;
  typeId: number;
  notes: string | null;
  created_date: string;
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
            breakTime: p.break_time ?? 0,
            focusTime: p.focus_time ?? 0,
            startTime: new Date(p.start_time),
            endTime: p.end_time ? new Date(p.end_time) : null,
            completed: p.is_completed ?? false,
            ruleId: p.id_pomodoro_rule,
            typeId: p.id_pomodoro_type,
            notes: p.notes,
            created_date: p.created_date
          }));

          return {
            id: s.id_session,
            name: s.session_name,
            pomodoros: pomodoros || [],
            total_focus_seconds: s.total_focus_seconds || 0,
            total_break_seconds: s.total_break_seconds || 0,
            total_pause_seconds: s.total_pause_seconds || 0,
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
            focusTime: 0,
            startTime: new Date(),
            endTime: null,
            completed: false,
            ruleId,
            typeId,
            notes: null,
            created_date: new Date().toISOString(),
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
    focusTime: number,
    breakTime: number,
    completed: boolean
  ) => {
    setSpaces((curr) =>
      curr.map((space) => {
        if (space.id === spaceId) {
          const updatedPomodoros = space.pomodoros.map((pomodoro: any) => {
            if (pomodoro.id === pomodoroId) {
              return {
                ...pomodoro,
                focusTime,
                breakTime,
                completed,
                endTime: completed ? new Date() : null,
              };
            }
            return pomodoro;
          });

          const totalTime = updatedPomodoros.reduce(
            (sum: number, p: any) => sum + p.focusTime,
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

  const refreshPomodoros = async (spaceId: string) => {
    setSpaces((curr) => {
      const target = curr.find((s) => s.id === spaceId);
      if (!target) return curr;

      return curr.map((space) => {
        if (space.id !== spaceId) return space;

        return {
          ...space,
          loading: true, // opcional si querés mostrar spinner
        };
      });
    });

    try {
      const pomodorosRaw = await listarPomodorosPorSesion(Number(spaceId));
      const pomodoros = pomodorosRaw.map((p: any) => ({
        id: String(p.id_pomodoro_detail),
        duration: p.planned_duration ?? 0,
        breakTime: p.break_time ?? 0,
        focusTime: p.focus_time ?? 0,
        startTime: new Date(p.start_time),
        endTime: p.end_time ? new Date(p.end_time) : null,
        completed: p.is_completed ?? false,
        ruleId: p.id_pomodoro_rule,
        typeId: p.id_pomodoro_type,
        notes: p.notes,
        created_date: p.created_date,
      }));

      setSpaces((curr) =>
        curr.map((space) => {
          if (space.id !== spaceId) return space;

          return {
            ...space,
            pomodoros,
            // opcional: actualizar totales si el backend no lo hace automáticamente
            total_focus_seconds: pomodoros.reduce((sum, p) => sum + p.focusTime, 0),
            total_break_seconds: pomodoros.reduce((sum, p) => sum + p.breakTime, 0),
          };
        })
      );
    } catch (error) {
      console.error('Error al refrescar pomodoros:', error);
    }
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
        refreshPomodoros
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
