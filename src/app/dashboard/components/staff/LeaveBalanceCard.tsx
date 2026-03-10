'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Plus } from 'lucide-react';

export interface LeaveBalance {
  type: string;
  used: number;
  total: number;
  color?: string; // optional for custom progress color
}

export interface LeaveBalanceCardProps {
  leaveBalances?: LeaveBalance[]; // make optional for default
  onApplyLeave?: () => void;
}

export function LeaveBalanceCard({
  leaveBalances = [
    { type: 'Annual Leave', used: 3, total: 12, color: 'bg-green-500' },
    { type: 'Sick Leave', used: 1, total: 8, color: 'bg-red-500' },
  ],
  onApplyLeave,
}: LeaveBalanceCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leave Balance</CardTitle>
          {onApplyLeave && (
            <Button size="sm" onClick={onApplyLeave}>
              <Plus className="w-4 h-4 mr-1" />
              Apply
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {leaveBalances.map((leave, index) => {
            const percentage = (leave.used / leave.total) * 100;
            const remaining = leave.total - leave.used;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{leave.type}</span>
                  <span className="text-gray-600">
                    {remaining} of {leave.total} days left
                  </span>
                </div>

                <Progress
                  value={percentage}
                  className={`h-2 ${leave.color ?? 'bg-blue-500'}`}
                />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Used: {leave.used} days</span>
                  <span>{percentage.toFixed(0)}% used</span>
                </div>
              </div>
            );
          })}

          {/* Upcoming leave section */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Upcoming Leave</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">Annual Leave</span>
                <span className="text-xs text-amber-600 font-medium">Approved</span>
              </div>
              <div className="text-xs text-gray-600">
                Dec 24, 2025 - Dec 31, 2025 (7 days)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
