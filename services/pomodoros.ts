import api from '../api/client';

export type PomodoroRule = {
    id_pomodoro_rule: number;
    difficulty_level: string;
    focus_duration: number;
    break_duration: number;
    description: string;
};

export type PomodoroType = {
    id_pomodoro_type: number;
    name_type: string;
};

export type PomodoroDetail = {
    id_pomodoro_detail: number;
    planned_duration: number;
    focus_time: number;
    break_time: number;
    is_completed: boolean;
    id_pomodoro_rule: number;
    id_pomodoro_type: number;
    notes: string | null;
    created_date: string;
};


export async function crearPomodoroEnBackend(data: {
    id_session: number;
    id_pomodoro_rule: number;
    id_pomodoro_type: number;
    event_type: 'focus' | 'break';
    planned_duration: number;
    is_completed: boolean;
    notes: string | null;
}): Promise<{ id_pomodoro_detail: number }> {
    try {
        const response = await api.post<{ id_pomodoro_detail: number }>('/pomodoros/crear', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear pomodoro:', error);
        throw new Error('No se pudo crear el pomodoro');
    }
}

export async function actualizarPomodoroEnBackend(
    id_pomodoro_detail: number,
    isCompleted: boolean,
    focusSeconds: number,
    breakSeconds: number,
    repetitions: number,
    interrupted: boolean
): Promise<{ message: string }> {
    const notes = `repeticiones=${repetitions}`;
    const payload = {
        is_completed: isCompleted,
        notes,
        focus_seconds: focusSeconds,
        break_seconds: breakSeconds,
    };

    try {
        const response = await api.put<{ message: string }>(
            `/pomodoros/${id_pomodoro_detail}`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar pomodoro:', error);
        throw new Error('No se pudo actualizar el pomodoro');
    }
}


export const listarPomodorosPorSesion = async (
    id_session: number
): Promise<PomodoroDetail[]> => {
    const response = await api.get(`/pomodoros/sesion/${id_session}`);
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn('Pomodoros recibidos no son un array:', data);
        return [];
    }
    return data;
};

export const getPomodoroRules = async (): Promise<PomodoroRule[]> => {
    const response = await api.get<PomodoroRule[]>('/reglas-pomodoro/');
    return response.data;
};

export const getPomodoroTypes = async (): Promise<PomodoroType[]> => {
    const response = await api.get<PomodoroType[]>('/tipos-pomodoro/');
    return response.data;
};