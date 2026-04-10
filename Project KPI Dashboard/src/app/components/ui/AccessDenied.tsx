import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from './card';

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = 'No tienes permiso para ver esta sección.' }: AccessDeniedProps) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex items-center gap-3 py-6">
        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
        <p className="text-amber-800 text-sm font-medium">{message}</p>
      </CardContent>
    </Card>
  );
}
