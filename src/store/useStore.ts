import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSameDay } from 'date-fns';
import i18n from '../i18n';

// --- DEFINICIÓN DE TIPOS ---

export interface Task { 
  id: string; 
  title: string; 
  completed: boolean; 
  estimatedPomodoros: number;
}

export interface Section { 
  id: string; 
  name: string; 
  tasks: Task[]; 
}

export interface Domain { 
  id: string; 
  name: string; 
  color: string; 
  sections: Section[]; 
}

export interface UserPreferences {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  language: 'en' | 'es';
}

export interface SessionLog {
  id: string;
  taskId: string | null;
  domainId: string | null;
  date: string;
  durationMinutes: number;
}

interface AppState {
  domains: Domain[];
  activeTaskId: string | null;
  preferences: UserPreferences;
  history: SessionLog[];
  sessionStreak: number;

  // Acciones
  addDomain: (name: string, color: string) => void;
  deleteDomain: (id: string) => void;
  addSection: (domainId: string, name: string) => void;
  deleteSection: (domainId: string, sectionId: string) => void;
  addTask: (domainId: string, sectionId: string, title: string, estimate: number) => void; 
  deleteTask: (domainId: string, sectionId: string, taskId: string) => void;
  toggleTask: (domainId: string, sectionId: string, taskId: string) => void;
  setActiveTask: (taskId: string | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  logSession: (durationMinutes: number) => void;
  resetSessionStreak: () => void;
  deleteSessionLog: (id: string) => void; // Definición del tipo
  
  // Selectores
  getDailySessionCount: () => number; 
}

// --- STORE IMPLEMENTATION ---

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado Inicial
      domains: [],
      activeTaskId: null,
      history: [],
      sessionStreak: 0,
      preferences: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        language: 'en',
      },

      // Getters
      getDailySessionCount: () => {
        const today = new Date();
        return get().history.filter(h => isSameDay(new Date(h.date), today)).length;
      },

      // Acciones
      addDomain: (name, color) => set((state) => ({
        domains: [...state.domains, { id: crypto.randomUUID(), name, color, sections: [] }]
      })),

      deleteDomain: (id) => set((state) => ({
        domains: state.domains.filter(d => d.id !== id)
      })),

      addSection: (domainId, name) => set((state) => ({
        domains: state.domains.map(d => 
          d.id === domainId 
            ? { ...d, sections: [...d.sections, { id: crypto.randomUUID(), name, tasks: [] }] }
            : d
        )
      })),

      deleteSection: (domainId, sectionId) => set((state) => ({
        domains: state.domains.map(d => 
          d.id === domainId
            ? { ...d, sections: d.sections.filter(s => s.id !== sectionId) }
            : d
        )
      })),

      addTask: (domainId, sectionId, title, estimate) => set((state) => ({
        domains: state.domains.map(d => 
          d.id === domainId 
            ? {
                ...d,
                sections: d.sections.map(s => 
                  s.id === sectionId
                    ? { ...s, tasks: [...s.tasks, { id: crypto.randomUUID(), title, completed: false, estimatedPomodoros: estimate }] }
                    : s
                )
              }
            : d
        )
      })),

      deleteTask: (domainId, sectionId, taskId) => set((state) => ({
        domains: state.domains.map(d => 
          d.id === domainId 
            ? {
                ...d,
                sections: d.sections.map(s => 
                  s.id === sectionId
                    ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
                    : s
                )
              }
            : d
        )
      })),

      toggleTask: (dId, sId, tId) => set((state) => ({
        domains: state.domains.map(d => 
          d.id === dId ? {
            ...d,
            sections: d.sections.map(s => s.id === sId ? {
              ...s,
              tasks: s.tasks.map(t => t.id === tId ? { ...t, completed: !t.completed } : t)
            } : s)
          } : d
        )
      })),

      setActiveTask: (id) => set({ activeTaskId: id }),

      updatePreferences: (newPrefs) => set((state) => {
        const mergedPrefs = { ...state.preferences, ...newPrefs };
        if (newPrefs.language && newPrefs.language !== state.preferences.language) {
          i18n.changeLanguage(newPrefs.language);
        }
        return { preferences: mergedPrefs };
      }),

      // AQUÍ ESTABA EL PROBLEMA: Asegúrate de que esta línea termine con coma
      resetSessionStreak: () => set({ sessionStreak: 0 }), 

      // Acción de borrar historial (con tipo explícito string)
      deleteSessionLog: (id: string) => set((state) => ({
        history: state.history.filter(h => h.id !== id)
      })),

      logSession: (durationMinutes) => {
        const state = get();
        // Tipo explícito para evitar error TS7005
        let domainId: string | null = null; 
        
        if (state.activeTaskId) {
            state.domains.forEach(d => {
                d.sections.forEach(s => {
                    const taskExists = s.tasks.some(t => t.id === state.activeTaskId);
                    if (taskExists) domainId = d.id;
                });
            });
        }
        set((state) => ({
          sessionStreak: state.sessionStreak + 1,
          history: [...state.history, {
            id: crypto.randomUUID(),
            taskId: state.activeTaskId,
            domainId, 
            date: new Date().toISOString(),
            durationMinutes
          }]
        }));
      }
    }),
    { 
      name: 'pomo-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.preferences.language) {
          i18n.changeLanguage(state.preferences.language);
        }
      }
    }
  )
);
