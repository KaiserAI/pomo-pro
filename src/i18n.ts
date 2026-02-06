import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- DICCIONARIOS ---
const resources = {
  en: {
    translation: {
      sidebar: {
        planner: "PLANNER",
        stats: "Statistics",
        settings: "Settings",
        open: "Open Planner",
        newArea: "New Area...",
        newProject: "New Project",
        newTask: "Task name...",
        estimate: "p", // 2p (pomodoros)
      },
      timer: {
        focus: "Focus",
        shortBreak: "Short Break",
        longBreak: "Long Break",
        session: "Session",
        streak: "STREAK",
        today: "TODAY",
        complete: "Session Complete!",
        completeBody: "Time to take a break or switch tasks.",
        breakComplete: "Break Over",
        breakBody: "Let's get back to work!",
        noTask: "No active task",
      },
      settings: {
        title: "Settings",
        language: "Language",
        work: "Focus Duration",
        short: "Short Break",
        long: "Long Break",
        save: "Save Changes",
        minutes: "minutes",
      },
      stats: {
        title: "Statistics Center",
        overview: "Overview",
        time: "Chronobiology",
        distribution: "Distribution",
        totalHours: "Total Hours",
        sessionsToday: "Sessions Today",
        totalSessions: "Total Sessions",
        accuracy: "Estimation Accuracy",
        subestimate: "Underestimating",
        overestimate: "Overestimating",
        realVsEst: "REALITY VS EXPECTATION",
        goldenHour: "Golden Hour",
        bestDay: "Best Day",
        areaTime: "Time by Area",
        noData: "Not enough data yet",
        history: "Session Log",
        date: "Date",
        duration: "Duration",
        task: "Task / Item",
        delete: "Delete",
        emptyHistory: "No sessions recorded yet."
      }
    }
  },
  es: {
    translation: {
      sidebar: {
        planner: "PLANIFICADOR",
        stats: "Estadísticas",
        settings: "Configuración",
        open: "Abrir Planificador",
        newArea: "Nueva Área...",
        newProject: "Nuevo Proyecto",
        newTask: "Nombre tarea...",
        estimate: "p",
      },
      timer: {
        focus: "Enfoque",
        shortBreak: "Descanso Corto",
        longBreak: "Descanso Largo",
        session: "Sesión",
        streak: "RACHA",
        today: "HOY",
        complete: "¡Sesión Completada!",
        completeBody: "Es hora de un descanso o cambiar de tarea.",
        breakComplete: "Descanso Terminado",
        breakBody: "¡A trabajar de nuevo!",
        noTask: "Sin tarea activa",
      },
      settings: {
        title: "Configuración",
        language: "Idioma",
        work: "Duración Enfoque",
        short: "Descanso Corto",
        long: "Descanso Largo",
        save: "Guardar Cambios",
        minutes: "minutos",
      },
      stats: {
        title: "Centro de Estadísticas",
        overview: "Resumen",
        time: "Cronobiología",
        distribution: "Distribución",
        totalHours: "Total Horas",
        sessionsToday: "Sesiones Hoy",
        totalSessions: "Total Sesiones",
        accuracy: "Precisión Est.",
        subestimate: "Subestimas tiempo",
        overestimate: "Sobrestimas tiempo",
        realVsEst: "REALIDAD VS EXPECTATIVA",
        goldenHour: "Hora Dorada",
        bestDay: "Día Favorito",
        areaTime: "Tiempo por Área",
        noData: "No hay datos suficientes",
        history: "Historial",
        date: "Fecha",
        duration: "Duración",
        task: "Tarea / Ítem",
        delete: "Eliminar",
        emptyHistory: "No hay sesiones registradas aún."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // <--- IDIOMA POR DEFECTO: INGLÉS
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
