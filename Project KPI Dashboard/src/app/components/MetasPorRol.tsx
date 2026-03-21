import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Target, 
  Users, 
  Coffee, 
  TrendingUp, 
  ShoppingCart,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Lightbulb,
  BarChart3,
  DollarSign,
  Calculator,
  Zap
} from 'lucide-react';

interface RolKPI {
  rol: string;
  persona: string;
  metaDiaria: string;
  metaDiariaNumero: number;
  valorActual: number;
  unidad: string;
  consultaDashboard: string;
  accionCorrectiva: string;
  columnaGoogleSheets: string;
  icon: any;
  color: string;
  status: 'cumplido' | 'en-riesgo' | 'critico';
}

export function MetasPorRol() {
  // Helper function - definir antes de usarla
  const formatChileno = (num: number): string => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Estado para visitas mensuales
  const [visitasMensuales, setVisitasMensuales] = useState<number>(3000); // Default: 3000 visitas/mes
  const diasMes = 30;

  // Cálculos dinámicos basados en visitas mensuales
  const visitasDiarias = visitasMensuales / diasMes;
  const ticketPromedio = 6500; // CLP
  const ventaDiaria = visitasDiarias * ticketPromedio;
  const revPSMDiario = ventaDiaria / 25; // 25 m²
  const margenNetoObjetivo = 0.30; // 30%
  const utilidadDiaria = ventaDiaria * margenNetoObjetivo;
  const conversionHotDesk = 40; // %

  const [rolesKPIs, setRolesKPIs] = useState<RolKPI[]>([
    {
      rol: 'Administrador',
      persona: 'Control Financiero',
      metaDiaria: `Utilidad > $${Math.round(utilidadDiaria / 1000)}k`,
      metaDiariaNumero: utilidadDiaria,
      valorActual: 0,
      unidad: 'CLP',
      consultaDashboard: '¿El Gasto Variable (Col E) está bajo control?',
      accionCorrectiva: 'Ajustar pedidos de insumos o turnos de personal',
      columnaGoogleSheets: 'K (Utilidad Neta)',
      icon: DollarSign,
      color: 'blue',
      status: 'critico'
    },
    {
      rol: 'Barista 1 (Full Time)',
      persona: 'Upselling & Ticket',
      metaDiaria: `Ticket Promedio > $${formatChileno(ticketPromedio)}`,
      metaDiariaNumero: ticketPromedio,
      valorActual: 0,
      unidad: 'CLP',
      consultaDashboard: '¿Estamos haciendo Upselling de pastelería?',
      accionCorrectiva: 'Reforzar sugerencia de acompañamiento (torta, brownie, sandwich)',
      columnaGoogleSheets: 'I (Venta Total) / Transacciones',
      icon: Coffee,
      color: 'orange',
      status: 'critico'
    },
    {
      rol: 'Barista 2 (Full Time)',
      persona: 'Productividad Espacial',
      metaDiaria: `RevPSM > $${formatChileno(revPSMDiario)}`,
      metaDiariaNumero: revPSMDiario,
      valorActual: 0,
      unidad: 'CLP/m²',
      consultaDashboard: '¿El flujo de Irarrázaval está entrando al local?',
      accionCorrectiva: 'Mejorar visibilidad de pizarra exterior y rotación de mesas',
      columnaGoogleSheets: 'M (RevPSM)',
      icon: TrendingUp,
      color: 'green',
      status: 'critico'
    },
    {
      rol: 'Barista 3 (30h)',
      persona: 'Conversión Digital',
      metaDiaria: `Conversión Hot Desk > ${conversionHotDesk}%`,
      metaDiariaNumero: conversionHotDesk,
      valorActual: 0,
      unidad: '%',
      consultaDashboard: '¿Los usuarios digitales están consumiendo café?',
      accionCorrectiva: 'Ofrecer "Refill" con descuento a usuarios de escritorio compartido',
      columnaGoogleSheets: 'Cálculo: Venta HotDesk / Usuarios',
      icon: Wifi,
      color: 'purple',
      status: 'critico'
    }
  ]);

  const [hasData, setHasData] = useState(false);

  const actualizarValores = (index: number, valor: number) => {
    const updatedRoles = [...rolesKPIs];
    updatedRoles[index].valorActual = valor;
    
    // Calcular status
    const porcentajeCumplimiento = (valor / updatedRoles[index].metaDiariaNumero) * 100;
    if (porcentajeCumplimiento >= 100) {
      updatedRoles[index].status = 'cumplido';
    } else if (porcentajeCumplimiento >= 80) {
      updatedRoles[index].status = 'en-riesgo';
    } else {
      updatedRoles[index].status = 'critico';
    }
    
    setRolesKPIs(updatedRoles);
    setHasData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cumplido': return 'bg-green-500';
      case 'en-riesgo': return 'bg-yellow-500';
      case 'critico': return 'bg-red-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'cumplido': return 'bg-green-50 border-green-500';
      case 'en-riesgo': return 'bg-yellow-50 border-yellow-500';
      case 'critico': return 'bg-red-50 border-red-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cumplido': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'en-riesgo': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critico': return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-600',
      orange: 'bg-orange-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600'
    };
    return colors[color] || 'bg-gray-600';
  };

  // Simular datos de ejemplo
  const cargarDatosEjemplo = () => {
    actualizarValores(0, 215000); // Admin: Utilidad
    actualizarValores(1, 7200);   // Barista 1: Ticket
    actualizarValores(2, 28000);  // Barista 2: RevPSM
    actualizarValores(3, 45);     // Barista 3: Conversión
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl font-bold">Metas por Rol - Sistema de Protección</h2>
        </div>
        <p className="text-gray-600">
          Cada rol tiene un "número" específico del que es responsable. Integración con Google Sheets y Make.
        </p>
      </div>

      {/* Card Dinámico de Visitas Mensuales */}
      <Card className="border-4 border-cyan-500 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="h-7 w-7 text-cyan-600" />
            🎯 Calculadora Dinámica de Metas
            <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              <Zap className="h-3 w-3 mr-1" />
              Automático
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa las visitas mensuales estimadas y las metas de cada rol se calcularán automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input de Visitas Mensuales */}
          <div className="bg-white p-6 rounded-xl border-2 border-cyan-300 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="visitas" className="text-base font-bold text-cyan-900 mb-2 block">
                  👥 Visitas Mensuales Proyectadas
                </Label>
                <Input
                  id="visitas"
                  type="number"
                  value={visitasMensuales}
                  onChange={(e) => setVisitasMensuales(Number(e.target.value))}
                  className="text-2xl font-bold h-14 border-2 border-cyan-500 focus:ring-cyan-600 text-center"
                  min="0"
                  step="100"
                />
                <p className="text-xs text-gray-600 mt-1">
                  ≈ {formatChileno(visitasDiarias)} visitas/día (basado en 30 días)
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  const updatedRoles = [...rolesKPIs];
                  updatedRoles[0].metaDiaria = `Utilidad > $${formatChileno(Math.round(utilidadDiaria))}`;
                  updatedRoles[0].metaDiariaNumero = utilidadDiaria;
                  updatedRoles[1].metaDiaria = `Ticket Promedio > $${formatChileno(ticketPromedio)}`;
                  updatedRoles[1].metaDiariaNumero = ticketPromedio;
                  updatedRoles[2].metaDiaria = `RevPSM > $${formatChileno(Math.round(revPSMDiario))}`;
                  updatedRoles[2].metaDiariaNumero = revPSMDiario;
                  updatedRoles[3].metaDiaria = `Conversión Hot Desk > ${conversionHotDesk}%`;
                  updatedRoles[3].metaDiariaNumero = conversionHotDesk;
                  setRolesKPIs(updatedRoles);
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Zap className="mr-2 h-5 w-5" />
                Actualizar Metas
              </Button>
            </div>
          </div>

          {/* Métricas Calculadas en Tiempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 opacity-80" />
                <Badge className="bg-white/20 text-white">Diario</Badge>
              </div>
              <p className="text-2xl font-bold">${formatChileno(Math.round(utilidadDiaria))}</p>
              <p className="text-xs opacity-90 mt-1">Utilidad Objetivo (Admin)</p>
              <p className="text-[10px] opacity-70 mt-2">
                {formatChileno(visitasDiarias)} visitas × ${formatChileno(ticketPromedio)} × 30% margen
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Coffee className="h-5 w-5 opacity-80" />
                <Badge className="bg-white/20 text-white">Ticket</Badge>
              </div>
              <p className="text-2xl font-bold">${formatChileno(ticketPromedio)}</p>
              <p className="text-xs opacity-90 mt-1">Meta Ticket (Barista 1)</p>
              <p className="text-[10px] opacity-70 mt-2">
                Target de upselling por transacción
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 opacity-80" />
                <Badge className="bg-white/20 text-white">RevPSM</Badge>
              </div>
              <p className="text-2xl font-bold">${formatChileno(Math.round(revPSMDiario))}</p>
              <p className="text-xs opacity-90 mt-1">Por m² (Barista 2)</p>
              <p className="text-[10px] opacity-70 mt-2">
                ${formatChileno(Math.round(ventaDiaria))} ÷ 25m² de local
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Wifi className="h-5 w-5 opacity-80" />
                <Badge className="bg-white/20 text-white">Digital</Badge>
              </div>
              <p className="text-2xl font-bold">{conversionHotDesk}%</p>
              <p className="text-xs opacity-90 mt-1">Conversión (Barista 3)</p>
              <p className="text-[10px] opacity-70 mt-2">
                % usuarios HotDesk que consumen
              </p>
            </div>
          </div>

          {/* Alert Explicativo */}
          <Alert className="border-cyan-500 bg-cyan-50">
            <Calculator className="h-4 w-4 text-cyan-600" />
            <AlertTitle className="text-cyan-900">📐 Cómo funciona el cálculo dinámico</AlertTitle>
            <AlertDescription className="text-sm text-cyan-800 space-y-2 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-cyan-200">
                  <p className="font-bold text-xs mb-1">1️⃣ Venta Diaria</p>
                  <code className="text-[10px] bg-gray-900 text-green-400 px-2 py-1 rounded block">
                    ({formatChileno(visitasMensuales)} ÷ 30) × ${formatChileno(ticketPromedio)}
                  </code>
                  <p className="text-[10px] mt-1">= ${formatChileno(Math.round(ventaDiaria))}/día</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-cyan-200">
                  <p className="font-bold text-xs mb-1">2️⃣ Utilidad Objetivo</p>
                  <code className="text-[10px] bg-gray-900 text-green-400 px-2 py-1 rounded block">
                    ${formatChileno(Math.round(ventaDiaria))} × 30% margen
                  </code>
                  <p className="text-[10px] mt-1">= ${formatChileno(Math.round(utilidadDiaria))}/día</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-cyan-200">
                  <p className="font-bold text-xs mb-1">3️⃣ RevPSM Esperado</p>
                  <code className="text-[10px] bg-gray-900 text-green-400 px-2 py-1 rounded block">
                    ${formatChileno(Math.round(ventaDiaria))} ÷ 25m²
                  </code>
                  <p className="text-[10px] mt-1">= ${formatChileno(Math.round(revPSMDiario))}/m²/día</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-cyan-200">
                  <p className="font-bold text-xs mb-1">4️⃣ Proyección Mensual</p>
                  <code className="text-[10px] bg-gray-900 text-green-400 px-2 py-1 rounded block">
                    ${formatChileno(Math.round(utilidadDiaria))} × 30 días
                  </code>
                  <p className="text-[10px] mt-1">= ${formatChileno(Math.round(utilidadDiaria * 30))}/mes</p>
                </div>
              </div>
              <p className="text-xs mt-3 font-semibold">
                💡 Cambia las <strong>"Visitas Mensuales"</strong> arriba y haz clic en <strong>"Actualizar Metas"</strong> para recalcular todas las métricas instantáneamente.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* CTA de Datos */}
      {!hasData && (
        <Alert className="border-blue-500 bg-blue-50">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <AlertTitle>Conecta tus datos</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Para ver el estado real de cada rol, conecta tu Google Sheet o carga datos manualmente.</p>
            <Button 
              onClick={cargarDatosEjemplo}
              size="sm"
              className="mt-2"
            >
              Cargar Datos de Ejemplo
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen General */}
      {hasData && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Resumen del Equipo (4 personas)</CardTitle>
            <CardDescription>Estado actual del cumplimiento de metas diarias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {rolesKPIs.filter(r => r.status === 'cumplido').length}
                </p>
                <p className="text-xs text-gray-600">Cumpliendo</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {rolesKPIs.filter(r => r.status === 'en-riesgo').length}
                </p>
                <p className="text-xs text-gray-600">En Riesgo</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {rolesKPIs.filter(r => r.status === 'critico').length}
                </p>
                <p className="text-xs text-gray-600">Críticos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round((rolesKPIs.filter(r => r.status === 'cumplido').length / rolesKPIs.length) * 100)}%
                </p>
                <p className="text-xs text-gray-600">Eficiencia Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas por Rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rolesKPIs.map((rol, index) => (
          <Card 
            key={index}
            className={`border-2 transition-all hover:shadow-xl ${getStatusBg(rol.status)}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg ${getColorClass(rol.color)} text-white`}>
                    <rol.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{rol.rol}</CardTitle>
                    <CardDescription className="font-medium">{rol.persona}</CardDescription>
                  </div>
                </div>
                {getStatusIcon(rol.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meta */}
              <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xs text-gray-600 mb-1">Meta Diaria</p>
                <p className="text-2xl font-bold">{rol.metaDiaria}</p>
              </div>

              {/* Valor Actual */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Estado Actual</span>
                  <span className="text-lg font-bold">
                    {rol.unidad === 'CLP' && '$'}
                    {formatChileno(rol.valorActual)}
                    {rol.unidad === '%' && '%'}
                    {rol.unidad === 'CLP/m²' && ' /m²'}
                  </span>
                </div>
                <Progress 
                  value={Math.min((rol.valorActual / rol.metaDiariaNumero) * 100, 100)}
                  className="h-3"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((rol.valorActual / rol.metaDiariaNumero) * 100)}% de la meta diaria
                </p>
              </div>

              <Separator />

              {/* Consulta Dashboard */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Consulta en Dashboard:</p>
                    <p className="text-sm text-blue-800">{rol.consultaDashboard}</p>
                  </div>
                </div>
              </div>

              {/* Acción Correctiva */}
              <div className={`p-3 rounded-lg border ${
                rol.status === 'cumplido' 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-orange-100 border-orange-300'
              }`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    rol.status === 'cumplido' ? 'text-green-600' : 'text-orange-600'
                  }`} />
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${
                      rol.status === 'cumplido' ? 'text-green-900' : 'text-orange-900'
                    }`}>
                      {rol.status === 'cumplido' ? '✓ Acción:' : '⚠ Acción Correctiva:'}
                    </p>
                    <p className={`text-sm ${
                      rol.status === 'cumplido' ? 'text-green-800' : 'text-orange-800'
                    }`}>
                      {rol.status === 'cumplido' 
                        ? 'Continuar con el buen trabajo y mantener el ritmo' 
                        : rol.accionCorrectiva
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna Google Sheets */}
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded text-xs">
                <span className="text-gray-600">Google Sheets:</span>
                <code className="bg-gray-800 text-green-400 px-2 py-1 rounded">
                  Columna {rol.columnaGoogleSheets}
                </code>
              </div>

              {/* Botón de Acción */}
              {rol.status !== 'cumplido' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    alert(`Acción para ${rol.rol}:\n\n${rol.accionCorrectiva}`);
                  }}
                >
                  Ver Acción Detallada
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integración con Make */}
      <Card className="border-purple-500 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Integración con Make para Alertas
          </CardTitle>
          <CardDescription>
            Configuración automática de notificaciones por rol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">📧 Notificación Administrador</p>
              <p className="text-sm text-gray-600 mb-2">Se activa cuando:</p>
              <ul className="text-xs space-y-1">
                <li>• Utilidad &lt; $200.000</li>
                <li>• Gasto Variable &gt; 30%</li>
                <li>• Margen Neto &lt; 25%</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">📱 Push Barista 1</p>
              <p className="text-sm text-gray-600 mb-2">Se activa cuando:</p>
              <ul className="text-xs space-y-1">
                <li>• Ticket Promedio &lt; $6.500</li>
                <li>• Hora pico sin upselling</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">🔔 Alerta Barista 2</p>
              <p className="text-sm text-gray-600 mb-2">Se activa cuando:</p>
              <ul className="text-xs space-y-1">
                <li>• RevPSM &lt; $25.000</li>
                <li>• Flujo bajo en Irarrázaval</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">💬 Recordatorio Barista 3</p>
              <p className="text-sm text-gray-600 mb-2">Se activa cuando:</p>
              <ul className="text-xs space-y-1">
                <li>• Conversión Hot Desk &lt; 40%</li>
                <li>• Usuarios sin consumo &gt; 30 min</li>
              </ul>
            </div>
          </div>

          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>🎉 Notificación Récord</AlertTitle>
            <AlertDescription>
              Cuando cualquier KPI rompe su récord histórico, se envía una notificación motivacional a todo el staff de 4 personas para reforzar el comportamiento positivo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Sync con Figma */}
      <Card className="border-blue-500 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Sincronización con Figma (Pouch Growl Reportes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertTitle>Plugin: Sync to Figma</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Usa el plugin <strong>Sync to Figma</strong> para:</p>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Actualizar el campo <code className="bg-gray-800 text-green-400 px-1 rounded">#StatusPayback</code> a verde cuando la Columna H supere $18.900.000</li>
                <li>• Cambiar el color de cada <code className="bg-gray-800 text-green-400 px-1 rounded">#KPI_Rol</code> según cumplimiento (verde/amarillo/rojo)</li>
                <li>• Mostrar el progreso visual del payback en tu prototipo</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold mb-2">Variables Figma a Sincronizar:</p>
            <div className="space-y-1 text-sm">
              <p><code className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded">#Admin_Utilidad</code> → Columna H</p>
              <p><code className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded">#Barista1_Ticket</code> → Columna J</p>
              <p><code className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded">#Barista2_RevPSM</code> → Columna G</p>
              <p><code className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded">#Barista3_Conversion</code> → Columna L</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}