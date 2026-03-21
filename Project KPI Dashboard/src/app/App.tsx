import { useState } from 'react';
import { CFODashboard } from './components/CFODashboard';
import { CFODashboardConsolidado } from './components/CFODashboardConsolidado';
import { DashboardProvider } from './contexts/DashboardContext';
import { Toaster } from 'sonner';
import { Button } from './components/ui/button';
import { Layers, LayoutGrid } from 'lucide-react';

export default function App() {
  const [modoConsolidado, setModoConsolidado] = useState(true);

  return (
    <DashboardProvider>
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        duration={3000}
      />
      
      {/* TOGGLE DE ARQUITECTURA */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant={modoConsolidado ? 'default' : 'outline'}
          size="sm"
          onClick={() => setModoConsolidado(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
        >
          <Layers className="mr-2 h-4 w-4" />
          Consolidado (4 tabs)
        </Button>
        <Button
          variant={!modoConsolidado ? 'default' : 'outline'}
          size="sm"
          onClick={() => setModoConsolidado(false)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Original (13 tabs)
        </Button>
      </div>

      <main id="main-content" role="main" aria-label="Dashboard CFO Principal">
        {modoConsolidado ? <CFODashboardConsolidado /> : <CFODashboard />}
      </main>
    </DashboardProvider>
  );
}