import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, UserPlus, Calendar, Award } from 'lucide-react';

interface Activity {
  id: string;
  type: 'join' | 'leave' | 'achievement' | 'checkin';
  employee: string;
  description: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'join':
        return <UserPlus className="w-4 h-4" />;
      case 'leave':
        return <Calendar className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      case 'checkin':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'join':
        return 'bg-green-100 text-green-600';
      case 'leave':
        return 'bg-yellow-100 text-yellow-600';
      case 'achievement':
        return 'bg-purple-100 text-purple-600';
      case 'checkin':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{getInitials(activity.employee)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{activity.employee}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
