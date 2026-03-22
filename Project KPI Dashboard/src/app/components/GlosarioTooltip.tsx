import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { HelpCircle } from 'lucide-react';

const GLOSARIO: Record<string, string> = {
  'RevPSM': 'Revenue Per Square Meter — Ingresos por metro cuadrado del local. Mide la eficiencia del espacio físico.',
  'CAPEX': 'Capital Expenditure — Inversión en activos fijos (equipamiento, remodelación, etc).',
  'Margen Bruto': 'Venta menos costos directos de producción, sin incluir costos fijos.',
  'Margen Neto': 'Utilidad después de deducir TODOS los costos: directos, laborales y fijos.',
  'Payback': 'Tiempo que tarda el negocio en recuperar la inversión inicial.',
  'Mix de Negocio': 'Proporción de ventas de cada línea (Café / Hotdesk / Asesorías) sobre el total.',
};

export function GlosarioTooltip({ termino }: { termino: string }) {
  const definicion = GLOSARIO[termino];
  if (!definicion) return <span>{termino}</span>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400">
            {termino}
            <HelpCircle className="h-3 w-3 text-gray-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          {definicion}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
