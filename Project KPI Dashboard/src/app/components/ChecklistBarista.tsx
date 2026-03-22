import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { LineaNegocio } from '../contexts/RoleContext';
import { ClipboardList } from 'lucide-react';

interface CheckItem {
  id: string;
  label: string;
  turno: 'AM' | 'PM';
}

const CHECKLIST_CAFE: CheckItem[] = [
  { id: 'cafe_am_1', label: 'Limpieza y preparación de máquina de café', turno: 'AM' },
  { id: 'cafe_am_2', label: 'Verificar stock de insumos (leche, granos, azúcar)', turno: 'AM' },
  { id: 'cafe_am_3', label: 'Abrir caja y verificar fondo', turno: 'AM' },
  { id: 'cafe_am_4', label: 'Activar cartel de "Abierto"', turno: 'AM' },
  { id: 'cafe_pm_1', label: 'Cierre de caja y cuadre de boletas', turno: 'PM' },
  { id: 'cafe_pm_2', label: 'Limpiar y sanitizar área de trabajo', turno: 'PM' },
  { id: 'cafe_pm_3', label: 'Registrar ventas del día en el sistema', turno: 'PM' },
  { id: 'cafe_pm_4', label: 'Verificar stock restante y anotar pedidos', turno: 'PM' },
];

const CHECKLIST_HOTDESK: CheckItem[] = [
  { id: 'hd_am_1', label: 'Verificar disponibilidad de puestos', turno: 'AM' },
  { id: 'hd_am_2', label: 'Confirmar reservas del día', turno: 'AM' },
  { id: 'hd_am_3', label: 'Revisar conectividad WiFi y acceso', turno: 'AM' },
  { id: 'hd_am_4', label: 'Limpiar y preparar estaciones de trabajo', turno: 'AM' },
  { id: 'hd_pm_1', label: 'Registrar ocupación real del día', turno: 'PM' },
  { id: 'hd_pm_2', label: 'Cierre de accesos y alarmas', turno: 'PM' },
  { id: 'hd_pm_3', label: 'Anotar incidencias del turno', turno: 'PM' },
];

interface ChecklistBaristaProps {
  linea: LineaNegocio;
}

export function ChecklistBarista({ linea }: ChecklistBaristaProps) {
  const items = linea === 'cafe' ? CHECKLIST_CAFE : CHECKLIST_HOTDESK;
  const storageKey = `dashfin_checklist_${linea}_${new Date().toISOString().slice(0, 10)}`;

  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checked]));
  }, [checked, storageKey]);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const amItems = items.filter(i => i.turno === 'AM');
  const pmItems = items.filter(i => i.turno === 'PM');
  const completedCount = items.filter(i => checked.has(i.id)).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Checklist de Turno
          </CardTitle>
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {completedCount}/{items.length} ({progress}%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[{ label: 'Turno AM', items: amItems }, { label: 'Turno PM', items: pmItems }].map(({ label, items: turnoItems }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
            <ul className="space-y-2">
              {turnoItems.map(item => (
                <li key={item.id} className="flex items-start gap-2">
                  <Checkbox
                    id={item.id}
                    checked={checked.has(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={item.id}
                    className={`text-sm leading-snug cursor-pointer ${checked.has(item.id) ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
