import api from '../api/client';

type CrearUsuarioResponse = {
    message: string;
    usuario: {
        id_user: number;
        nickname: string;
        created_date: string;
    };
};


export interface Usuario {
    id_user: number;
    nickname: string;
    created_date: string;
}

export const iniciarSesion = async (nickname: string): Promise<Usuario> => {
    const response = await api.get<Usuario>(`/usuarios/nickname/${nickname}`);
    return response.data;
};


export const crearUsuario = async (nickname: string): Promise<Usuario> => {
    const response = await api.post<CrearUsuarioResponse>('/usuarios/', { nickname });
    return response.data.usuario;
}
