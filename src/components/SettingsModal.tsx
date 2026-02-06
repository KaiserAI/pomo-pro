import { X, Save, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: Props) => {
  const { preferences, updatePreferences } = useStore();
  const [values, setValues] = useState(preferences);
  const { t, i18n } = useTranslation();

  // Sincronizar estado local cuando las preferencias cambian
  useEffect(() => { 
    setValues(preferences); 
    // Asegurar que i18n esté sincronizado con el store al abrir
    if (preferences.language && i18n.language !== preferences.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences, i18n]);

  const handleSave = () => {
    updatePreferences(values);
    // Cambiar el idioma globalmente al guardar
    if (values.language) {
      i18n.changeLanguage(values.language);
    }
    onClose();
  };

  const handleLanguageChange = (lang: 'en' | 'es') => {
    setValues({ ...values, language: lang });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-xl font-bold text-white">{t('settings.title')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6">
          
          {/* Selector de Idioma */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 flex items-center gap-2">
                <Globe size={12} /> {t('settings.language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => handleLanguageChange('en')}
                    className={`p-2 rounded border text-sm transition-all ${values.language === 'en' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                    English
                </button>
                <button 
                    onClick={() => handleLanguageChange('es')}
                    className={`p-2 rounded border text-sm transition-all ${values.language === 'es' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                    Español
                </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('settings.minutes')}</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">{t('timer.focus')}</label>
                <input 
                  type="number" 
                  value={values.workDuration}
                  onChange={(e) => setValues({...values, workDuration: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center text-white focus:border-emerald-500 outline-none transition-colors font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">{t('settings.short')}</label>
                <input 
                  type="number" 
                  value={values.shortBreakDuration}
                  onChange={(e) => setValues({...values, shortBreakDuration: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center text-white focus:border-orange-500 outline-none transition-colors font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400">{t('settings.long')}</label>
                <input 
                  type="number" 
                  value={values.longBreakDuration}
                  onChange={(e) => setValues({...values, longBreakDuration: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center text-white focus:border-blue-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-6 pt-0">
          <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Save size={18} /> {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
