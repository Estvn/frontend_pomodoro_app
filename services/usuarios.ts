import api from '../api/client';

export interface Usuario {
    id_user: number;
    nickname: string;
    created_date: string;
}

export const iniciarSesion = async (nickname: string): Promise<Usuario> => {
    const response = await api.get<Usuario>(`/usuarios/nickname/${nickname}`);
    return response.data;
};

export const iniciarRegistro = async (email: string, nickname: string): Promise<any> => {
    const response = await api.post('/auth/start-registration', {
        email,
        nickname
    });
    return response.data;
};

export const completarRegistro = async (email: string, codigo: string): Promise<any> => {
    const response = await api.post('/auth/verify', {
        email,
        code: codigo
    });
    return response.data;
};

export const reenviarCodigo = async (email: string): Promise<any> => {
    const response = await api.post('/auth/resend-code', {
        email
    })
    return response.data;
};

export const solicitarRecuperacionUsuario = async (email: string): Promise<any> => {
  const response = await api.post('/auth/forgot-username', {
    email
  });
  return response.data;
};

export const verificarRecuperacionUsuario = async (email: string, code: string): Promise<any> => {
  const response = await api.post('/auth/verify-recovery', {
    email,
    code
  });
  return response.data;
};