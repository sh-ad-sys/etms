import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  status: 'On Time' | 'Late' | 'Early Leave' | 'Absent';
  totalHours: string;
}

interface AttendanceHistoryCardProps {
  records: AttendanceRecord[];
}

export function AttendanceHistoryCard({ records }: AttendanceHistoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time':
        return 'bg-green-100 text-green-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Early Leave':
        return 'bg-orange-100 text-orange-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="week" className="space-y-3">
            {records.map((record, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{record.date}</div>
                      <div className="text-xs text-gray-500">{record.day}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(record.status)} variant="secondary">
                    {record.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Check In</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.checkIn}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Check Out</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.checkOut}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Hours</div>
                    <div className="font-medium">{record.totalHours}</div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="month">
            <div className="text-center py-8 text-gray-500">
              Monthly view coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="text-center py-8 text-gray-500">
              Custom date range selector coming soon
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
