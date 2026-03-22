import { ShieldX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = 'No tienes permisos para ver este contenido.' }: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Alert className="max-w-md border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Acceso restringido</AlertTitle>
        <AlertDescription className="text-red-700">{message}</AlertDescription>
      </Alert>
    </div>
  );
}
