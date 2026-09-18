import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình Supabase.',
      count: 0,
      data: []
    });
  }

  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message, count: 0, data: [] }, { status: 400 });
    }

    const formatted = (data || []).map(item => ({
      id: item.id,
      computerId: item.computer_id,
      time: item.time_slot,
      val: item.load_percentage,
      label: item.computer_id
    }));

    return NextResponse.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message, count: 0, data: [] }, { status: 500 });
  }
}
