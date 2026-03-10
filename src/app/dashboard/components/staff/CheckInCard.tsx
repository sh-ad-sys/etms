import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export function CheckInCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    setCheckedIn(true);
    setCheckInTime(currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="bg-linear-to-br
 from-blue-600 to-blue-800 text-white border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Today&apos;s Attendance</CardTitle>

          {checkedIn ? (
            <Badge className="bg-green-500 text-white border-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Checked In
            </Badge>
          ) : (
            <Badge className="bg-yellow-500 text-white border-0">Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Time */}
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">{formatTime(currentTime)}</div>
            <div className="text-blue-100 text-sm">{formatDate(currentTime)}</div>
          </div>

          {checkedIn ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Check-in Time</span>
                </div>
                <span className="font-semibold">{checkInTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </div>
                <span className="text-sm">Office - Main Building</span>
              </div>
              <div className="pt-2 border-t border-white/20">
                <div className="text-xs text-blue-100 mb-1">Shift Schedule</div>
                <div className="font-semibold">09:00 AM - 06:00 PM</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center mb-3">
                  <QrCode className="w-24 h-24 text-white" />
                </div>
                <p className="text-gray-600 text-sm text-center">Scan this QR code at the terminal</p>
                <p className="text-xs text-gray-400 mt-1">Code updates daily at midnight</p>
              </div>

              {/* Check-in Button */}
              <Button 
                onClick={handleCheckIn}
                className="w-full bg-white text-blue-600 hover:bg-blue-50"
                size="lg"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Check In Now
              </Button>

              <div className="text-xs text-blue-100 text-center">
                Make sure GPS is enabled for location verification
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
