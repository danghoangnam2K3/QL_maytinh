import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình biến môi trường Supabase.',
      count: 0,
      data: []
    });
  }

  try {
    const { data, error } = await supabase
      .from('borrow_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message, count: 0, data: [] }, { status: 400 });
    }

    const formattedData = (data || []).map(r => ({
      id: r.id,
      computerId: r.computer_id,
      computerName: r.computer_name || r.computer_id,
      requester: r.requester,
      requesterId: r.requester_id,
      reason: r.reason,
      duration: r.duration,
      status: r.status,
      createdAt: r.created_at
    }));

    return NextResponse.json({ success: true, count: formattedData.length, data: formattedData });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message, count: 0, data: [] }, { status: 500 });
  }
}

export async function POST(req) {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình Supabase để gửi yêu cầu.'
    }, { status: 503 });
  }

  try {
    const body = await req.json();
    const newReq = {
      id: 'REQ-' + Math.floor(100 + Math.random() * 900),
      computer_id: body.computerId,
      computer_name: body.computerName || body.computerId,
      requester: body.requesterName || 'Hồ Ngọc Hoàng Long',
      requester_id: body.requesterId || 'NV0001171',
      reason: body.reason || 'Thực hành máy tính',
      duration: body.duration || '2 giờ',
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('borrow_requests')
      .insert([newReq])
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Gửi yêu cầu mượn máy lên Supabase thành công!', data: data ? data[0] : newReq }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
