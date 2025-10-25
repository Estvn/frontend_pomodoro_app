import api from '../api/client';

type IniciarPausaResponse = {
    pausa: {
        id_pause: number;
        id_pomodoro_detail: number;
        pause_start: string;
    };
};

type FinalizarPausaResponse = {
    pausa: {
        id_pause: number;
        total_pause_seconds: number;
        pause_start: string;
        pause_end: string;
    };
};

export const iniciarPausa = async (id_pomodoro_detail: number): Promise<number> => {
    const response = await api.post<IniciarPausaResponse>('/pausas/', null, {
        params: { id_pomodoro_detail },
    });
    return response.data.pausa.id_pause;
};

export const finalizarPausa = async (id_pause: number) => {
    const response = await api.put<FinalizarPausaResponse>(`/pausas/${id_pause}/finalizar`);
    return response.data.pausa;
};