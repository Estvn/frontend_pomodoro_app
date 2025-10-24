import api from '../api/client';

export interface Sesion {
    id_session: number;
    id_user: number;
    session_name: string;
    created_date: string;
}

export interface SesionBackend {
    id_session: number;
    session_name: string;
    total_focus_minutes: number;
    total_break_minutes: number;
    total_pause_minutes: number;
    created_date: string;
}

export const crearSesion = async (id_user: number, session_name: string): Promise<Sesion> => {
    const response = await api.post<{ sesion: Sesion }>(
        `/sesiones/?id_user=${id_user}&session_name=${encodeURIComponent(session_name)}`
    );
    return response.data.sesion;
};


export const listarSesiones = async (id_user: number): Promise<SesionBackend[]> => {
    const response = await api.get<SesionBackend[]>(`/sesiones/usuario/${id_user}`);
    return response.data;
};
