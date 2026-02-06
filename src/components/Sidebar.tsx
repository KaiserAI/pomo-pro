import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, LayoutGrid, Settings, BarChart2, CheckCircle2, Circle, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { SettingsModal } from './SettingsModal';
import { StatsModal } from './StatsModal';
import { useTranslation } from 'react-i18next';

export const Sidebar = () => {
  const { domains, addDomain, deleteDomain, addSection, deleteSection, addTask, deleteTask, activeTaskId, setActiveTask, toggleTask } = useStore();
  const { t } = useTranslation();
  
  const [isOpen, setIsOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Estado para controlar qué secciones están expandidas
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Estados de Formularios
  const [newDomainName, setNewDomainName] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskEstimate, setNewTaskEstimate] = useState(1);

  // --- HANDLERS ---
  const handleAddDomain = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newDomainName.trim()) {
      addDomain(newDomainName, 'bg-emerald-500'); 
      setNewDomainName("");
    }
  };

  const handleAddSection = (e: React.KeyboardEvent, domainId: string) => {
    if (e.key === 'Enter' && newSectionName.trim()) {
      addSection(domainId, newSectionName);
      setNewSectionName("");
      setEditingSection(null);
      setExpandedItems(prev => ({ ...prev, [domainId]: true }));
    }
  };

  const handleAddTask = (e: React.KeyboardEvent, domainId: string, sectionId: string) => {
    if (e.key === 'Enter' && newTaskName.trim()) {
      addTask(domainId, sectionId, newTaskName, newTaskEstimate);
      setNewTaskName("");
      setNewTaskEstimate(1);
      setEditingTask(null);
    }
  };

  const getUnfinishedCount = (tasks: any[]) => tasks.filter(t => !t.completed).length;
  const getDomainUnfinishedCount = (domain: any) => domain.sections.reduce((acc: number, sec: any) => acc + getUnfinishedCount(sec.tasks), 0);

  return (
    <>
      <div 
        className={clsx(
          "h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-10 shadow-2xl", 
          isOpen ? "w-80" : "w-20"
        )}
      >
        
        {/* --- MODO COLAPSADO (NAVIGATION RAIL) --- */}
        {!isOpen ? (
            <div className="flex flex-col items-center h-full py-6 gap-8 animate-in fade-in duration-500">
                <button 
                    onClick={() => setIsOpen(true)}
                    className="p-3 bg-slate-800 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20 group relative"
                >
                    <PanelLeftOpen size={24} />
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                        {t('sidebar.open')}
                    </span>
                </button>

                <div className="flex-1 w-[1px] bg-gradient-to-b from-transparent via-slate-800 to-transparent" />

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => setShowStats(true)}
                        className="p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors group relative"
                    >
                        <BarChart2 size={24} />
                        <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                            {t('sidebar.stats')}
                        </span>
                    </button>
                    
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors group relative"
                    >
                        <Settings size={24} />
                        <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                            {t('sidebar.settings')}
                        </span>
                    </button>
                </div>
            </div>
        ) : (
            // --- MODO EXPANDIDO ---
            <>
                <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16 shrink-0 animate-in fade-in">
                    <h2 className="font-bold text-slate-200 tracking-wide text-sm flex items-center gap-2">
                        <LayoutGrid size={16} className="text-emerald-500" />
                        {t('sidebar.planner')}
                    </h2>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Cerrar menú"
                    >
                        <PanelLeftClose size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide animate-in fade-in slide-in-from-left-4">
                
                {/* Input Crear Dominio */}
                <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700 focus-within:border-emerald-500 transition-colors mb-6">
                    <Plus size={16} className="text-slate-500" />
                    <input 
                        type="text" 
                        placeholder={t('sidebar.newArea')}
                        className="bg-transparent text-sm w-full outline-none text-white placeholder:text-slate-600"
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                        onKeyDown={handleAddDomain}
                    />
                </div>

                {/* Lista de Dominios */}
                {domains.map(domain => {
                    const domainCount = getDomainUnfinishedCount(domain);
                    const isExpanded = expandedItems[domain.id];

                    return (
                    <div key={domain.id} className="select-none">
                        
                        <div 
                        className={clsx(
                            "flex items-center justify-between group p-2 rounded-lg cursor-pointer transition-colors", 
                            isExpanded ? "bg-slate-800" : "hover:bg-slate-800/50"
                        )}
                        onClick={() => toggleExpand(domain.id)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                                <span className="text-sm font-bold text-slate-300 truncate uppercase tracking-wide group-hover:text-white transition-colors">
                                    {domain.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {domainCount > 0 && <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-md">{domainCount}</span>}
                                <button onClick={(e) => { e.stopPropagation(); deleteDomain(domain.id); }} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1">
                                <Trash2 size={12} />
                                </button>
                            </div>
                        </div>

                        {isExpanded && (
                        <div className="pl-4 mt-1 space-y-1 border-l border-slate-800 ml-3 animate-in slide-in-from-top-1">
                            {domain.sections.map(section => {
                            const sectionCount = getUnfinishedCount(section.tasks);
                            const isSecExpanded = expandedItems[section.id];

                            return (
                                <div key={section.id}>
                                <div 
                                    className="flex items-center justify-between group/sec p-1.5 rounded hover:bg-slate-800/50 cursor-pointer"
                                    onClick={() => toggleExpand(section.id)}
                                >
                                    <div className="flex items-center gap-2 text-slate-400 group-hover/sec:text-slate-200 transition-colors">
                                        {isSecExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                        <span className="text-xs font-medium">{section.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {sectionCount > 0 && <span className="text-[10px] bg-slate-800 text-slate-500 px-1 rounded">{sectionCount}</span>}
                                        <button onClick={(e) => { e.stopPropagation(); deleteSection(domain.id, section.id); }} className="opacity-0 group-hover/sec:opacity-100 text-slate-600 hover:text-red-400">
                                        <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>

                                {isSecExpanded && (
                                    <div className="pl-5 space-y-1 mt-1 mb-3">
                                    {section.tasks.map(task => (
                                        <div key={task.id} className={clsx("group/task flex items-center justify-between p-2 rounded-md text-sm transition-all border", activeTaskId === task.id ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/30 border-transparent hover:bg-slate-800 text-slate-300")}>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <button onClick={(e) => { e.stopPropagation(); toggleTask(domain.id, section.id, task.id); }}>
                                                {task.completed ? <CheckCircle2 size={14} className="text-slate-500" /> : <Circle size={14} className="text-slate-600 hover:text-emerald-500" />}
                                            </button>
                                            <span onClick={() => setActiveTask(task.id)} className={clsx("truncate cursor-pointer flex-1", task.completed && "line-through opacity-50")}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!task.completed && (
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1 rounded border border-slate-700">
                                                {task.estimatedPomodoros || 1}{t('sidebar.estimate')}
                                            </span>
                                            )}
                                            <button onClick={() => deleteTask(domain.id, section.id, task.id)} className="opacity-0 group-hover/task:opacity-100 text-slate-600 hover:text-red-400">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        </div>
                                    ))}
                                    {editingTask === section.id ? (
                                        <div className="flex items-center gap-1 bg-slate-900 border border-emerald-500/50 rounded p-1">
                                        <input autoFocus className="flex-1 bg-transparent text-xs text-white outline-none min-w-0" placeholder={t('sidebar.newTask')} value={newTaskName} onChange={e => setNewTaskName(e.target.value)} onKeyDown={e => handleAddTask(e, domain.id, section.id)} />
                                        <input type="number" min="1" max="10" className="w-8 bg-slate-800 text-center text-xs text-white rounded outline-none" value={newTaskEstimate} onChange={e => setNewTaskEstimate(Number(e.target.value))} onKeyDown={e => handleAddTask(e, domain.id, section.id)} />
                                        </div>
                                    ) : (
                                        <button onClick={() => setEditingTask(section.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 py-1 px-2 mt-1"> <Plus size={10} /> {t('sidebar.newTask')} </button>
                                    )}
                                    </div>
                                )}
                                </div>
                            );
                            })}
                            {editingSection === domain.id ? (
                            <input autoFocus className="w-full bg-slate-800 rounded p-1 text-xs text-white outline-none border border-blue-500/50 mt-2" placeholder={t('sidebar.newProject')} value={newSectionName} onChange={e => setNewSectionName(e.target.value)} onKeyDown={e => handleAddSection(e, domain.id)} onBlur={() => setEditingSection(null)} />
                            ) : (
                            <button onClick={() => setEditingSection(domain.id)} className="text-xs text-slate-600 hover:text-blue-400 flex items-center gap-1 mt-2 pl-1"> <Plus size={12} /> {t('sidebar.newProject')} </button>
                            )}
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>

                <div className="p-4 border-t border-slate-800 shrink-0 space-y-1">
                <button onClick={() => setShowStats(true)} className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors w-full p-2 rounded-lg hover:bg-slate-800">
                    <BarChart2 size={20} /> <span className="text-sm font-medium">{t('sidebar.stats')}</span>
                </button>
                <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-slate-800">
                    <Settings size={20} /> <span className="text-sm font-medium">{t('sidebar.settings')}</span>
                </button>
                </div>
            </>
        )}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
    </>
  );
};
