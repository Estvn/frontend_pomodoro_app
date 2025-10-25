import React, { useState } from 'react';
import { SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { crearUsuario } from '../../services/usuarios';
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
    const [mensaje, setMensaje] = useState('');
    const { login } = useApp();

    const handleSignUp = async () => {
        if (!nickname.trim()) return;
        setMensaje('');

        try {
            const usuario = await crearUsuario(nickname.trim());
            console.log("usuario:", usuario);
            await login(usuario.id_user, usuario.nickname);
            toHome();
            setMensaje(`Usuario ${nickname} creado exitosamente`);
        } catch (error: any) {
            setMensaje(error.response?.data?.detail || 'Error al registrar');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.centerContainer}>
                <Text style={styles.title}>🍅 Pomodoro Sessions</Text>
                <Text style={styles.subtitle}>Registro</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Crea tu nombre de usuario"
                    value={nickname}
                    onChangeText={setNickname}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                />

                <TouchableOpacity
                    style={[styles.button, !nickname.trim() && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={!nickname.trim()}
                >
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>
                {mensaje ? <Text style={styles.messageText}>{mensaje}</Text> : null}
                <TouchableOpacity onPress={onSwitchToSignIn}>
                    <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default SignUpScreen;