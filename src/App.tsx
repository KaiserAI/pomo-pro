import { Timer } from "./components/Timer";
import { Sidebar } from "./components/Sidebar";

function App() {
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white overflow-hidden">
      {/* Barra Lateral - Se queda quieta a la izquierda */}
      <Sidebar />

      {/* Contenedor Principal - Ocupa TODO el espacio restante */}
      <main className="flex-1 relative flex items-center justify-center bg-slate-950">
        
        {/* Fondo decorativo sutil (opcional) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-slate-950 pointer-events-none" />

        {/* El Reloj: Centrado absolutamente en este espacio */}
        <div className="w-full max-w-5xl px-4 z-0">
           <Timer />
        </div>
      </main>
    </div>
  );
}

export default App;
