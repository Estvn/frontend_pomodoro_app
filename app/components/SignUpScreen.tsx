import { useState } from 'react';
import { SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { completarRegistro, iniciarRegistro, reenviarCodigo } from '../../services/usuarios';
import { useApp } from '../context/AppContext';
import { default as styles } from '../styles';

export const SignUpScreen = ({
    toHome,
    onSwitchToSignIn
}: {
    toHome: () => void;
    onSwitchToSignIn: () => void
}) => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [codigoVerificacion, setCodigoVerificacion] = useState('');
    const [paso, setPaso] = useState<'formulario' | 'verificacion'>('formulario');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const { login } = useApp();

    const handleIniciarRegistro = async () => {
        if (!nickname.trim() || !email.trim()) {
            setMensaje('Por favor completa todos los campos');
            return;
        }

        if (!email.includes('@')) {
            setMensaje('Por favor ingresa un email válido');
            return;
        }

        setCargando(true);
        setMensaje('');

        try {
            const data = await iniciarRegistro(email.trim(), nickname.trim());
            console.log("Código enviado:", data);
            setMensaje(`Código de verificación enviado a ${email}`);
            setPaso('verificacion');
        } catch (error: any) {
            setMensaje(error.response?.data?.detail || 'Error al iniciar registro');
        } finally {
            setCargando(false);
        }
    };

    const handleCompletarRegistro = async () => {
        if (!codigoVerificacion.trim()) {
            setMensaje('Por favor ingresa el código de verificación');
            return;
        }

        setCargando(true);
        setMensaje('');

        try {
            const data = await completarRegistro(email.trim(), codigoVerificacion.trim());
            console.log("Usuario creado:", data);
            
            const userId = data.usuario?.id_user;
            
            if (!userId) {
                throw new Error('No se pudo obtener el ID del usuario creado');
            }
            
            
            login(userId, nickname.trim());
            
            toHome();
            
        } catch (error: any) {
            setMensaje(error.response?.data?.detail || 'Error al verificar código');
        } finally {
            setCargando(false);
        }
    };

    const handleReenviarCodigo = async () => {
        setCargando(true);
        try {
            await reenviarCodigo(email.trim());
            setMensaje('Nuevo código enviado');
        } catch (error: any) {
            setMensaje(error.response?.data?.detail || 'Error al reenviar código');
        } finally {
            setCargando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.centerContainer}>
                <Text style={styles.title}>🍅 Pomodoro Sessions</Text>
                <Text style={styles.subtitle}>
                    {paso === 'formulario' ? 'Registro' : 'Verificación'}
                </Text>

                {paso === 'formulario' ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Tu email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Crea tu nombre de usuario"
                            value={nickname}
                            onChangeText={setNickname}
                            autoCapitalize="none"
                            placeholderTextColor="#999"
                        />

                        <TouchableOpacity
                            style={[styles.button, (!nickname.trim() || !email.trim() || cargando) && styles.buttonDisabled]}
                            onPress={handleIniciarRegistro}
                            disabled={!nickname.trim() || !email.trim() || cargando}
                        >
                            <Text style={styles.buttonText}>
                                {cargando ? 'Enviando código...' : 'Enviar código de verificación'}
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* ✅ AHORA instrucciones EXISTE */}
                        <Text style={styles.instrucciones}>
                            Ingresa el código de verificación que enviamos a {email}
                        </Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Código de 6 dígitos"
                            value={codigoVerificacion}
                            onChangeText={setCodigoVerificacion}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholderTextColor="#999"
                        />

                        <TouchableOpacity
                            style={[styles.button, (!codigoVerificacion.trim() || cargando) && styles.buttonDisabled]}
                            onPress={handleCompletarRegistro}
                            disabled={!codigoVerificacion.trim() || cargando}
                        >
                            <Text style={styles.buttonText}>
                                {cargando ? 'Verificando...' : 'Verificar y crear cuenta'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleReenviarCodigo} disabled={cargando}>
                            <Text style={styles.linkText}>¿No recibiste el código? Reenviar</Text>
                        </TouchableOpacity>
                    </>
                )}

                {mensaje ? <Text style={styles.messageText}>{mensaje}</Text> : null}
                
                <TouchableOpacity onPress={onSwitchToSignIn}>
                    <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default SignUpScreen;