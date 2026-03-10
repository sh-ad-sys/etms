import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  iconColor: string;
  iconBgColor: string;
}

export function StatsCard({ title, value, icon: Icon, change, changeType = 'neutral', iconColor, iconBgColor }: StatsCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-600';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-semibold mt-2">{value}</p>
            {change && (
              <p className={`text-sm mt-2 ${changeColor}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`${iconBgColor} p-4 rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
