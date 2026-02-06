import { useMemo, useState } from 'react';
import { X, Trophy, Flame, Calendar, Activity, Clock, PieChart as PieIcon, History, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { subDays, format, isSameDay, eachDayOfInterval, getHours, getDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

interface Props { isOpen: boolean; onClose: () => void; }

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const StatsModal = ({ isOpen, onClose }: Props) => {
  const { history, domains, preferences, deleteSessionLog } = useStore();
  const { t, i18n } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'time' | 'distribution' | 'history'>('overview');

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const stats = useMemo(() => {
    const totalSessions = history.length;
    const totalMinutes = history.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const todaySessions = history.filter(h => isSameDay(new Date(h.date), new Date())).length;
    
    let totalEstimatedMins = 0;
    let totalRealMins = 0;
    
    domains.forEach(d => d.sections.forEach(s => s.tasks.forEach(t => {
      if (t.completed && t.estimatedPomodoros && t.estimatedPomodoros > 0) {
        totalEstimatedMins += t.estimatedPomodoros * preferences.workDuration;
        const real = history.filter(h => h.taskId === t.id).reduce((acc, h) => acc + h.durationMinutes, 0);
        totalRealMins += real;
      }
    })));

    const accuracy = totalEstimatedMins > 0 ? Math.round((totalEstimatedMins / totalRealMins) * 100) : 0;
    return { totalHours, todaySessions, totalSessions, accuracy, totalEstimatedMins, totalRealMins };
  }, [history, domains, preferences]);

  const domainData = useMemo(() => {
    const map = new Map<string, number>();
    history.forEach(h => {
      if (h.domainId) {
        const domain = domains.find(d => d.id === h.domainId);
        const name = domain ? domain.name : 'Otros';
        map.set(name, (map.get(name) || 0) + h.durationMinutes);
      } else {
        map.set('Sin Área', (map.get('Sin Área') || 0) + h.durationMinutes);
      }
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [history, domains]);

  const goldenHourData = useMemo(() => {
    const hours = Array(24).fill(0);
    history.forEach(h => {
      const hour = getHours(new Date(h.date));
      hours[hour] += h.durationMinutes;
    });
    return hours.map((mins, i) => ({ hour: `${i}:00`, mins }));
  }, [history]);

  const bestDayData = useMemo(() => {
    const days = Array(7).fill(0);
    history.forEach(h => {
      const day = getDay(new Date(h.date));
      days[day] += h.durationMinutes;
    });
    const labels = i18n.language === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const rotatedValues = [...days.slice(1), days[0]]; 
    const rotatedLabels = [...labels.slice(1), labels[0]];
    return rotatedLabels.map((name, i) => ({ name, mins: rotatedValues[i] }));
  }, [history, i18n.language]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 364), end: today });
    return days.map(day => {
      const count = history.filter(h => isSameDay(new Date(h.date), day)).length;
      let intensity = 0;
      if (count > 0) intensity = 1;
      if (count > 2) intensity = 2;
      if (count > 5) intensity = 3;
      if (count > 8) intensity = 4;
      return { date: day, count, intensity };
    });
  }, [history]);

  const getTaskName = (taskId: string | null) => {
    if (!taskId) return "Sesión libre";
    let foundName = null;
    domains.forEach(d => d.sections.forEach(s => s.tasks.forEach(t => {
      if (t.id === taskId) foundName = t.title;
    })));
    return foundName || "Tarea eliminada";
  };

  const getHeatColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-slate-800/50';
      case 1: return 'bg-emerald-900';
      case 2: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-300 shadow-[0_0_10px_#10b981]';
      default: return 'bg-slate-800/50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        <div className="border-b border-slate-800 bg-slate-950 p-6 pb-0 z-10 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <Activity className="text-emerald-500" size={24} />
               <h2 className="text-xl font-bold text-white">{t('stats.title')}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-6 text-sm font-medium overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab('overview')} className={clsx("pb-4 border-b-2 transition-colors px-2 whitespace-nowrap", activeTab === 'overview' ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-300")}>{t('stats.overview')}</button>
            <button onClick={() => setActiveTab('time')} className={clsx("pb-4 border-b-2 transition-colors px-2 whitespace-nowrap", activeTab === 'time' ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-300")}>{t('stats.time')}</button>
            <button onClick={() => setActiveTab('distribution')} className={clsx("pb-4 border-b-2 transition-colors px-2 whitespace-nowrap", activeTab === 'distribution' ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-300")}>{t('stats.distribution')}</button>
            <button onClick={() => setActiveTab('history')} className={clsx("pb-4 border-b-2 transition-colors px-2 whitespace-nowrap", activeTab === 'history' ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-300")}>{t('stats.history')}</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard icon={Clock} label={t('stats.totalHours')} value={`${stats.totalHours}h`} color="text-blue-400" bg="bg-blue-500/10" />
                    <MetricCard icon={Flame} label={t('stats.sessionsToday')} value={stats.todaySessions} color="text-orange-400" bg="bg-orange-500/10" />
                    <MetricCard icon={Trophy} label={t('stats.totalSessions')} value={stats.totalSessions} color="text-purple-400" bg="bg-purple-500/10" />
                    <MetricCard icon={Activity} label={t('stats.accuracy')} value={`${stats.accuracy}%`} color="text-emerald-400" bg="bg-emerald-500/10" subtext={stats.totalEstimatedMins > 0 ? (stats.accuracy > 100 ? t('stats.subestimate') : t('stats.overestimate')) : t('stats.noData')} />
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-300 font-bold mb-6 flex items-center gap-2 text-sm"><Activity size={16} /> {t('stats.realVsEst')}</h3>
                    {stats.totalEstimatedMins > 0 ? (
                    <div className="flex flex-col gap-4">
                        <div className="h-12 flex rounded-lg overflow-hidden bg-slate-800 relative">
                        <div className="absolute inset-y-0 left-0 bg-slate-700/30 w-full flex items-center justify-center text-xs text-slate-500 font-mono tracking-widest uppercase">{t('stats.estTarget')}</div>
                        <div className={clsx("h-full transition-all duration-1000", stats.totalRealMins > stats.totalEstimatedMins ? "bg-red-500/80" : "bg-emerald-500/80")} style={{ width: `${Math.min((stats.totalRealMins / stats.totalEstimatedMins) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                        <div className="text-slate-400">{t('stats.estLabel')}: <span className="text-white">{(stats.totalEstimatedMins / 60).toFixed(1)}h</span></div>
                        <div className={stats.totalRealMins > stats.totalEstimatedMins ? "text-red-400" : "text-emerald-400"}>{t('stats.realLabel')}: <span className="font-bold">{(stats.totalRealMins / 60).toFixed(1)}h</span></div>
                        </div>
                    </div>
                    ) : (
                    <p className="text-slate-500 text-sm italic text-center py-4">{t('stats.completionNote')}</p>
                    )}
                </div>
                <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Constancia Anual</h3>
                    <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {heatmapData.map((day, i) => (
                        <div key={i} className={clsx("w-3 h-3 rounded-sm transition-all hover:scale-125", getHeatColor(day.intensity))} title={`${format(day.date, 'dd MMM yyyy', { locale: dateLocale })}: ${day.count}`} />
                        ))}
                    </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-80 flex flex-col">
                        <h3 className="text-slate-300 font-bold mb-4 text-sm uppercase flex items-center gap-2"><Clock size={16} /> {t('stats.goldenHour')}</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={goldenHourData}>
                                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                <Bar dataKey="mins" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-80 flex flex-col">
                        <h3 className="text-slate-300 font-bold mb-4 text-sm uppercase flex items-center gap-2"><Calendar size={16} /> {t('stats.bestDay')}</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bestDayData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                <Bar dataKey="mins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-[500px] flex flex-col">
                    <h3 className="text-slate-300 font-bold mb-4 text-sm uppercase flex items-center gap-2"><PieIcon size={16} /> {t('stats.areaTime')}</h3>
                    <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        {/* CORRECCIÓN 3: Cambiado (entry, index) por (_, index) para evitar error de unused variable */}
                        <Pie data={domainData} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={5} dataKey="value">
                            {domainData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.3)" />)}
                        </Pie>
                        {/* CORRECCIÓN 4: Cambiado el tipo del formatter a any para evitar conflicto estricto */}
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value: any) => [`${(value/60).toFixed(1)}h`, '']} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    {domainData.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">{t('stats.noData')}</div>}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <History size={48} className="mx-auto mb-4 opacity-20" />
                            <p>{t('stats.emptyHistory')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3">{t('stats.date')}</th>
                                        <th className="px-6 py-3">{t('stats.task')}</th>
                                        <th className="px-6 py-3">{t('stats.duration')}</th>
                                        <th className="px-6 py-3 text-right">{t('stats.delete')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...history].reverse().map((log) => (
                                        <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-400">
                                                {format(new Date(log.date), 'dd MMM HH:mm', { locale: dateLocale })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {getTaskName(log.taskId)}
                                            </td>
                                            <td className="px-6 py-4 text-emerald-400">
                                                {log.durationMinutes} min
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => deleteSessionLog(log.id)}
                                                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                                    title={t('stats.delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, bg, subtext }: any) => (
  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors">
    <div className={`p-3 rounded-lg ${color} ${bg}`}><Icon size={24} /></div>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      {subtext && <p className="text-[10px] text-slate-400 mt-1.5">{subtext}</p>}
    </div>
  </div>
);
