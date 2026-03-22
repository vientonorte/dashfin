import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { LineaNegocio } from '../contexts/RoleContext';

interface ChecklistItem {
  id: string;
  label: string;
  turno: 'AM' | 'PM';
}

const CHECKLIST_CAFE: ChecklistItem[] = [
  { id: 'cafe-am-1', label: 'Encender máquina de café y purgar', turno: 'AM' },
  { id: 'cafe-am-2', label: 'Verificar stock de leche y granos', turno: 'AM' },
  { id: 'cafe-am-3', label: 'Limpiar vitrinas y mesas', turno: 'AM' },
  { id: 'cafe-am-4', label: 'Revisar productos del día', turno: 'AM' },
  { id: 'cafe-pm-1', label: 'Reposición de productos', turno: 'PM' },
  { id: 'cafe-pm-2', label: 'Limpieza profunda de máquina', turno: 'PM' },
  { id: 'cafe-pm-3', label: 'Cuadrar caja del día', turno: 'PM' },
  { id: 'cafe-pm-4', label: 'Cerrar y asegurar local', turno: 'PM' },
];

const CHECKLIST_HOTDESK: ChecklistItem[] = [
  { id: 'hd-am-1', label: 'Encender equipos y verificar WiFi', turno: 'AM' },
  { id: 'hd-am-2', label: 'Limpiar escritorios y sillas', turno: 'AM' },
  { id: 'hd-am-3', label: 'Verificar reservas del día', turno: 'AM' },
  { id: 'hd-am-4', label: 'Preparar zona de impresión', turno: 'AM' },
  { id: 'hd-pm-1', label: 'Verificar satisfacción de usuarios', turno: 'PM' },
  { id: 'hd-pm-2', label: 'Ofrecer bebidas a coworkers', turno: 'PM' },
  { id: 'hd-pm-3', label: 'Registrar uso de puestos', turno: 'PM' },
  { id: 'hd-pm-4', label: 'Apagar equipos y cerrar', turno: 'PM' },
];

function getChecklist(linea: LineaNegocio): ChecklistItem[] {
  if (linea === 'cafe') return CHECKLIST_CAFE;
  if (linea === 'hotdesk') return CHECKLIST_HOTDESK;
  return [...CHECKLIST_CAFE, ...CHECKLIST_HOTDESK];
}

function getStorageKey(linea: LineaNegocio): string {
  const today = new Date().toISOString().split('T')[0];
  return `dashfin_checklist_${linea}_${today}`;
}

export function ChecklistBarista({ linea }: { linea: LineaNegocio }) {
  const items = getChecklist(linea);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [turno, setTurno] = useState<'AM' | 'PM'>(() => {
    return new Date().getHours() < 14 ? 'AM' : 'PM';
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getStorageKey(linea));
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [linea]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(linea), JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, linea]);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = items.filter((i) => i.turno === turno);
  const doneCount = filtered.filter((i) => checked[i.id]).length;
  const total = filtered.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">📋 Checklist de Turno</CardTitle>
            <CardDescription>
              {doneCount}/{total} completadas
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant={turno === 'AM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTurno('AM')}
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              AM
            </Button>
            <Button
              variant={turno === 'PM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTurno('PM')}
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              PM
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 rounded-md p-2 text-left transition-colors ${
                  checked[item.id]
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-muted'
                }`}
              >
                {checked[item.id] ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    checked[item.id] ? 'line-through opacity-70' : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
