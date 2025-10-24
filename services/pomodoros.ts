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

type IniciarPomodoroResponse = {
    pomodoro: {
        id_pomodoro_detail: number;
    };
};

type FinalizarPomodoroResponse = {
    pomodoro: {
        id_pomodoro_detail: number;
    };
};

type PomodoroDetail = {
    id_pomodoro_detail: number;
    duration: number;
    completed_time: number;
    start_time: string;
    end_time: string | null;
    is_completed: boolean;
    id_pomodoro_rule: number;
    id_pomodoro_type: number;
};


export const iniciarPomodoroEnBackend = async ({
    id_session,
    id_pomodoro_rule,
    id_pomodoro_type,
    event_type = 'focus',
    planned_duration,
    notes = null,
}: {
    id_session: number;
    id_pomodoro_rule: number;
    id_pomodoro_type: number;
    event_type?: string;
    planned_duration: number;
    notes?: string | null;
}) => {
    const response = await api.post<IniciarPomodoroResponse>('/pomodoros/', null, {
        params: {
            id_session,
            id_pomodoro_rule,
            id_pomodoro_type,
            event_type,
            planned_duration,
            notes,
        },
    });
    console.log('Pomodoro response:', response.data);
    return response.data.pomodoro.id_pomodoro_detail;

};

export const finalizarPomodoroEnBackend = async (
    id_pomodoro_detail: number,
    completed_time: number,
    is_completed: boolean = true
) => {
    const response = await api.put<FinalizarPomodoroResponse>(
        `/pomodoros/${id_pomodoro_detail}/completar`,
        {
            completed_time,
            is_completed,
        }
    );
    return response.data.pomodoro;
};


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


