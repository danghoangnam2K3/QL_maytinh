import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình biến môi trường Supabase (NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY).',
      count: 0,
      data: []
    });
  }

  try {
    const { data, error } = await supabase
      .from('computers')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message, count: 0, data: [] }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: data ? data.length : 0, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message, count: 0, data: [] }, { status: 500 });
  }
}

export async function POST(req) {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình Supabase để thêm dữ liệu.'
    }, { status: 503 });
  }

  try {
    const body = await req.json();
    const newComp = {
      id: (body.id || body.name).toUpperCase().trim(),
      name: (body.name || body.id).toUpperCase().trim(),
      room: body.room || 'C201',
      cpu: body.cpu || 'Intel Core i5',
      ram: body.ram || '16GB DDR4',
      gpu: body.gpu || 'NVIDIA GPU',
      status: body.status || 'available',
      current_user_name: null,
      notes: body.notes || 'Thiết bị mới bổ sung'
    };

    const { data, error } = await supabase
      .from('computers')
      .insert([newComp])
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Thêm máy tính vào Supabase thành công!', data: data ? data[0] : newComp }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
