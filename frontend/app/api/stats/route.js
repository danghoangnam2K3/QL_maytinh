import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      userCount: 42,
      totalComputers: 6,
      inUseComputers: 1,
      availableComputers: 4,
      maintenanceComputers: 1,
      pendingRequests: 1,
      totalUsageHours: '128.5h',
      statusCounts: {
        available: 4,
        inUse: 1,
        maintenance: 1
      },
      hourlyUsage: [
        { time: '07:00', count: 1 },
        { time: '09:00', count: 4 },
        { time: '11:00', count: 5 },
        { time: '13:00', count: 3 },
        { time: '15:00', count: 6 },
        { time: '17:00', count: 4 },
        { time: '19:00', count: 2 },
        { time: '21:00', count: 1 }
      ]
    }
  });
}
