import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ExplorePomodoroScreen() {
  const { colors, dark } = useTheme();

  const cardStyle = {
    backgroundColor: dark ? '#2c2c2c' : '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: dark ? 0 : 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  };

  const cardTextStyle = {
    fontSize: 16,
    lineHeight: 24,
    color: dark ? '#eee' : '#333',
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="timer"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Técnica Pomodoro
        </ThemedText>
      </ThemedView>

      <Collapsible title="¿Qué es Pomodoro?">
        <View style={cardStyle}>
          <ThemedText style={cardTextStyle}>
            La técnica Pomodoro consiste en dividir el trabajo en bloques de concentración llamados "pomodoros", con pausas cortas entre ellos. Ayuda a mejorar la concentración, la productividad y a reducir la fatiga mental.
          </ThemedText>
        </View>
      </Collapsible>

      <Collapsible title="Tipos de Pomodoro">
        <View style={cardStyle}>
          <ThemedText style={cardTextStyle}>
            Estudio: Para sesiones de aprendizaje y repaso de contenido.{"\n\n"}
            Trabajo: Para tareas laborales y proyectos profesionales.{"\n\n"}
            Lectura: Para lectura profunda y comprensión de textos.{"\n\n"}
            Ejercicio: Para entrenamientos cortos o pausas activas.{"\n\n"}
            Meditación: Para relajación y enfoque mental.{"\n\n"}
            Proyectos Personales: Para hobbies o metas individuales.{"\n\n"}
            Tareas del Hogar: Para organización y limpieza de la casa.{"\n\n"}
            Desarrollo de Habilidades: Para practicar y mejorar competencias.{"\n\n"}
            Planificación y Organización: Para preparar agendas y gestionar tiempo.{"\n\n"}
            Descanso Activo: Para estiramientos, caminatas o pausas energéticas.
          </ThemedText>
        </View>
      </Collapsible>

      <Collapsible title="Reglas Pomodoro">
        <View style={cardStyle}>
          <ThemedText style={cardTextStyle}>
            Paso de bebé: 10 min de enfoque / 5 min de descanso. Ideal para principiantes que comienzan a desarrollar su concentración.{"\n\n"}
            Popular: 25 min de enfoque / 5 min de descanso. Método clásico que equilibra trabajo y descanso para productividad.{"\n\n"}
            Medio: 40 min de enfoque / 8 min de descanso. Para quienes buscan sesiones más largas y descansos adecuados.{"\n\n"}
            Intenso: 60 min de enfoque / 10 min de descanso. Para usuarios avanzados que quieren maximizar la concentración.{"\n\n"}
            Extendido: 80 min de enfoque / 13 min de descanso. Para expertos que buscan sesiones prolongadas con descansos más largos.
          </ThemedText>
        </View>
      </Collapsible>

      <Collapsible title="Beneficios">
        <View style={cardStyle}>
          <ThemedText style={cardTextStyle}>
            - Mejora la concentración{"\n"}
            - Reduce el estrés{"\n"}
            - Aumenta la productividad{"\n"}
            - Permite medir tu rendimiento diario
          </ThemedText>
        </View>
      </Collapsible>

      <Collapsible title="Consejos prácticos">
        <View style={cardStyle}>
          <ThemedText style={cardTextStyle}>
            - Evita distracciones y notificaciones.{"\n"}
            - Ajusta la duración de los pomodoros según tu concentración.{"\n"}
            - Usa los descansos para estirarte o tomar agua.{"\n"}
            - Reflexiona al final del día sobre lo que lograste.
          </ThemedText>
        </View>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});
