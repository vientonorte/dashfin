import { type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';

interface BusinessLineCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  marginPercent: string;
  sharePercent: number;
  accentColor: 'orange' | 'blue' | 'purple';
  formatter: (n: number) => string;
}

const colorMap = {
  orange: {
    border: 'border-l-4 border-orange-500',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    valuText: 'text-orange-600',
    badge: 'bg-orange-500 text-white',
    progress: '[&>[data-slot=indicator]]:bg-orange-500',
  },
  blue: {
    border: 'border-l-4 border-blue-500',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    valuText: 'text-blue-600',
    badge: 'bg-blue-500 text-white',
    progress: '[&>[data-slot=indicator]]:bg-blue-500',
  },
  purple: {
    border: 'border-l-4 border-purple-500',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    valuText: 'text-purple-600',
    badge: 'bg-purple-500 text-white',
    progress: '[&>[data-slot=indicator]]:bg-purple-500',
  },
} as const;

export function BusinessLineCard({
  icon: Icon,
  label,
  value,
  marginPercent,
  sharePercent,
  accentColor,
  formatter,
}: BusinessLineCardProps) {
  const colors = colorMap[accentColor];

  return (
    <Card className={`${colors.border} transition-shadow hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-lg p-1.5 ${colors.iconBg}`}>
              <Icon className={`h-4 w-4 ${colors.iconText}`} />
            </span>
            <CardTitle className="text-sm font-semibold">{label}</CardTitle>
          </div>
          <Badge className={`text-xs ${colors.badge}`}>
            {marginPercent} margen
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className={`text-2xl font-bold ${colors.valuText}`}>{formatter(value)}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Participación en total</span>
            <span className="font-medium">{sharePercent.toFixed(1)}%</span>
          </div>
          <Progress
            value={sharePercent}
            className={`h-1.5 ${colors.progress}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
