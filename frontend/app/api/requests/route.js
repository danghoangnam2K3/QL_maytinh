import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const FALLBACK_REQUESTS = [
  {
    id: 'REQ-101',
    computer_id: 'M01',
    computer_name: 'M01',
    requester: 'Nguyễn Thanh Tùng',
    requester_id: 'SV2021001',
    reason: 'Làm bài tập lớn Kiến trúc máy tính',
    duration: '2 giờ',
    created_at: '2026-09-18 19:15',
    status: 'approved'
  },
  {
    id: 'REQ-102',
    computer_id: 'M04',
    computer_name: 'M04',
    requester: 'Đặng Mai Phương',
    requester_id: 'SV2021045',
    reason: 'Demo đồ án Tốt nghiệp chuyên ngành',
    duration: '4 giờ',
    created_at: '2026-09-18 20:30',
    status: 'pending'
  },
  {
    id: 'REQ-103',
    computer_id: 'M02',
    computer_name: 'M02',
    requester: 'Lê Quốc Hưng',
    requester_id: 'SV2021088',
    reason: 'Không có lý do rõ ràng',
    duration: '1 giờ',
    created_at: '2026-09-18 18:00',
    status: 'rejected'
  }
];

export async function GET() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('borrow_requests').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    } catch (e) {}
  }
  return NextResponse.json({ success: true, count: FALLBACK_REQUESTS.length, data: FALLBACK_REQUESTS });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newReq = {
      id: 'REQ-' + Math.floor(100 + Math.random() * 900),
      computer_id: body.computerId,
      computer_name: body.computerName || body.computerId,
      requester: body.requesterName || 'Hồ Ngọc Hoàng Long',
      requester_id: body.requesterId || 'NV0001171',
      reason: body.reason || 'Làm bài thực hành',
      duration: body.duration || '2 giờ',
      status: 'pending',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (supabase) {
      const { data, error } = await supabase.from('borrow_requests').insert([newReq]).select();
      if (!error && data) {
        return NextResponse.json({ success: true, message: 'Gửi yêu cầu mượn máy thành công!', data: data[0] }, { status: 201 });
      }
    }

    return NextResponse.json({ success: true, message: 'Gửi yêu cầu mượn máy thành công!', data: newReq }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
