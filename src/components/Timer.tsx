import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Brain, Coffee, Sunset } from 'lucide-react';
import { clsx } from 'clsx';
import { useTimer } from '../hooks/useTimer';
import { useStore } from '../store/useStore';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { playNotificationSound } from '../utils/audio';
import { useTranslation } from 'react-i18next';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export const Timer = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const { activeTaskId, domains, preferences, logSession, sessionStreak, resetSessionStreak, getDailySessionCount } = useStore();
  const { t } = useTranslation();
  
  const dailyCount = getDailySessionCount();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  let activeTaskTitle = t('timer.noTask');
  let activeColor = "text-slate-400";
  if (activeTaskId) {
    domains.forEach(d => d.sections.forEach(s => s.tasks.forEach(t => {
      if (t.id === activeTaskId) {
        activeTaskTitle = t.title;
        activeColor = d.color.replace('bg-', 'text-');
      }
    })));
  }

  // Traducciones dinámicas para los modos
  const MODES = {
    focus: { time: preferences.workDuration * 60, color: 'text-emerald-400', bg: 'bg-emerald-500', icon: Brain, label: t('timer.focus') },
    shortBreak: { time: preferences.shortBreakDuration * 60, color: 'text-orange-300', bg: 'bg-orange-400', icon: Coffee, label: t('timer.shortBreak') },
    longBreak: { time: preferences.longBreakDuration * 60, color: 'text-blue-300', bg: 'bg-blue-400', icon: Sunset, label: t('timer.longBreak') }
  };

  const { seconds, setSeconds, isActive, toggle, reset } = useTimer(MODES['focus'].time);

  // --- WAKE LOCK ---
  useEffect(() => {
    const manageWakeLock = async () => {
      try {
        if (isActive) {
          if (!wakeLockRef.current && 'wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } else {
          if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
          }
        }
      } catch (err) {
        console.warn("No se pudo bloquear la pantalla:", err);
      }
    };
    manageWakeLock();
    return () => { if (wakeLockRef.current) wakeLockRef.current.release(); };
  }, [isActive]);

  // Actualizar timer si cambian preferencias o modo
  useEffect(() => { reset(MODES[mode].time); }, [mode, preferences]);

  const handleTimerComplete = async () => {
    playNotificationSound();
    
    if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
    }

    let permission = await isPermissionGranted();
    if (!permission) {
      const result = await requestPermission();
      permission = result === 'granted';
    }
    if (permission) {
      sendNotification({
        title: mode === 'focus' ? t('timer.complete') : t('timer.breakComplete'),
        body: mode === 'focus' ? t('timer.completeBody') : t('timer.breakBody'),
      });
    }
    handleNextPhase();
  };

  const handleNextPhase = () => {
    if (mode === 'focus') {
      logSession(preferences.workDuration);
      const nextStreak = sessionStreak + 1;
      
      if (nextStreak % 4 === 0) setMode('longBreak');
      else setMode('shortBreak');
    } else {
      setMode('focus');
    }
  };

  useEffect(() => { if (seconds === 0 && !isActive) handleTimerComplete(); }, [seconds, isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [m, s] = e.target.value.split(':').map(Number);
    if (!isNaN(m)) setSeconds(m * 60 + (s || 0));
  };
  
  const currentTheme = MODES[mode];
  const Icon = currentTheme.icon;

  return (
    <div className={clsx("flex flex-col items-center justify-center transition-colors duration-700 w-full h-full", currentTheme.color)}>
      
      {/* Contadores Superiores */}
      <div className="absolute top-8 md:top-12 flex items-center gap-6 text-sm font-medium animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
           <span className="text-slate-400 uppercase tracking-widest text-xs">{t('timer.streak')}</span>
           <span className={clsx("text-lg font-bold tabular-nums", currentTheme.color)}>{sessionStreak}</span>
           <button 
             onClick={resetSessionStreak}
             className="ml-2 p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors"
             title="Reiniciar racha"
           >
             <RotateCcw size={14} />
           </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
           <span className="text-slate-400 uppercase tracking-widest text-xs">{t('timer.today')}</span>
           <span className="text-lg font-bold text-white tabular-nums">{dailyCount}</span>
        </div>
      </div>

      {/* Cabecera Tarea */}
      <div className="flex flex-col items-center gap-4 mb-4 mt-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className={clsx("p-3 rounded-2xl bg-white/5 backdrop-blur-sm shadow-xl ring-1 ring-white/10", currentTheme.color)}>
          <Icon size={32} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.3em] uppercase opacity-75 mb-1">{currentTheme.label}</p>
          <h3 className={clsx("text-xl md:text-2xl font-light mt-2 transition-colors", mode === 'focus' ? activeColor : "text-slate-400")}>
            {activeTaskTitle}
          </h3>
        </div>
      </div>

      {/* Reloj */}
      <div className="relative group w-full flex justify-center py-4">
        <input type="text" value={formatTime(seconds)} onChange={handleInputChange} className={clsx("w-full text-center bg-transparent border-none outline-none font-bold tabular-nums tracking-tighter leading-none select-all", "text-[15vw] md:text-[12rem]", "transition-all duration-500 cursor-pointer hover:opacity-80 focus:opacity-100 placeholder-shown:opacity-100", currentTheme.color)} />
      </div>

      {/* Controles */}
      <div className="flex items-center gap-6 sm:gap-10 mt-4">
        <button onClick={() => reset(MODES[mode].time)} className="p-4 rounded-xl hover:bg-white/5 hover:text-white transition-all active:scale-95 text-inherit opacity-70 hover:opacity-100">
          <RotateCcw size={28} />
        </button>
        <button onClick={toggle} className={clsx("w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-[2rem] text-slate-950 transition-all shadow-2xl hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 active:translate-y-0", currentTheme.bg)}>
          {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
        </button>
        <button onClick={handleNextPhase} className="p-4 rounded-xl hover:bg-white/5 hover:text-white transition-all active:scale-95 text-inherit opacity-70 hover:opacity-100">
          <SkipForward size={28} />
        </button>
      </div>

      {/* Puntos de Progreso */}
      <div className="mt-12 flex gap-3 opacity-50">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={clsx("h-2 rounded-full transition-all duration-500", (sessionStreak % 4) >= i ? `w-8 ${currentTheme.bg}` : "w-2 bg-slate-700")} />
        ))}
      </div>
    </div>
  );
};
