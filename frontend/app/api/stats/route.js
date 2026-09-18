import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình Supabase.',
      data: {
        userCount: 0,
        totalComputers: 0,
        inUseComputers: 0,
        availableComputers: 0,
        maintenanceComputers: 0,
        pendingRequests: 0,
        totalUsageHours: '0.0h',
        statusCounts: { available: 0, inUse: 0, maintenance: 0 }
      }
    });
  }

  try {
    // 1. Get profile count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Get computers
    const { data: computers } = await supabase
      .from('computers')
      .select('status');

    const totalComps = computers ? computers.length : 0;
    const available = computers ? computers.filter(c => c.status === 'available').length : 0;
    const inUse = computers ? computers.filter(c => c.status === 'in_use').length : 0;
    const maintenance = computers ? computers.filter(c => c.status === 'maintenance').length : 0;

    // 3. Get pending requests
    const { count: pendingRequests } = await supabase
      .from('borrow_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 4. Calculate total usage hours from approved/completed requests or usage logs
    const { data: usageLogs } = await supabase
      .from('usage_logs')
      .select('load_percentage');

    const totalUsageHours = usageLogs && usageLogs.length > 0
      ? (usageLogs.reduce((acc, curr) => acc + (curr.load_percentage || 0), 0) / 10).toFixed(1) + 'h'
      : '0.0h';

    return NextResponse.json({
      success: true,
      data: {
        userCount: userCount || 0,
        totalComputers: totalComps,
        inUseComputers: inUse,
        availableComputers: available,
        maintenanceComputers: maintenance,
        pendingRequests: pendingRequests || 0,
        totalUsageHours,
        statusCounts: {
          available,
          inUse,
          maintenance
        }
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
