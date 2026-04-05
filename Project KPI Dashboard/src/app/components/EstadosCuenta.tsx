// ============================================================================
// ESTADOS DE CUENTA — Módulo principal de finanzas personales.
// Integra importación, tabla editable, dashboard y centro de privacidad.
// ============================================================================

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, TableProperties, BarChart2, Shield } from 'lucide-react';
import { PrivacyProvider } from '../contexts/PrivacyContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import { ImportadorEstados } from './ImportadorEstados';
import { TablaTransacciones } from './TablaTransacciones';
import { DashboardPersonal } from './DashboardPersonal';
import { CentroPrivacidad } from './CentroPrivacidad';

function EstadosCuentaInner() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">Estados de Cuenta</h2>
        <p className="text-sm text-muted-foreground">
          Importa, revisa y analiza tus transacciones personales. Todos los datos se almacenan localmente con cifrado AES-256.
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabsList className="h-9 bg-muted">
          <TabsTrigger value="import" className="text-xs gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="table" className="text-xs gap-1.5">
            <TableProperties className="h-3.5 w-3.5" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs gap-1.5">
            <BarChart2 className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Privacidad
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="import">
            <ImportadorEstados />
          </TabsContent>
          <TabsContent value="table">
            <TablaTransacciones />
          </TabsContent>
          <TabsContent value="dashboard">
            <DashboardPersonal />
          </TabsContent>
          <TabsContent value="privacy">
            <CentroPrivacidad />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function EstadosCuenta() {
  return (
    <PrivacyProvider>
      <TransactionProvider>
        <EstadosCuentaInner />
      </TransactionProvider>
    </PrivacyProvider>
  );
}
