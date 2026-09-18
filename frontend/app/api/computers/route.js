import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const FALLBACK_COMPUTERS = [
  { id: 'M04', name: 'M04', room: 'C201', cpu: 'Intel Core i7-13700', ram: '16GB DDR5', gpu: 'RTX 3060 12GB', status: 'available', current_user_name: null, notes: 'Máy hoạt động mượt mà, đầy đủ phần mềm thực hành' },
  { id: 'M03', name: 'M03', room: 'C201', cpu: 'Intel Core i5-13400', ram: '16GB DDR4', gpu: 'GTX 1660 Super', status: 'available', current_user_name: null, notes: 'Đã cập nhật Visual Studio 2022 và Docker' },
  { id: 'M02', name: 'M02', room: 'C201', cpu: 'Intel Core i7-12700', ram: '32GB DDR4', gpu: 'RTX 3070 8GB', status: 'available', current_user_name: null, notes: 'Cấu hình đồ hoạ & AI/ML' },
  { id: 'M01', name: 'M01', room: 'C201', cpu: 'Intel Core i5-12400', ram: '16GB DDR4', gpu: 'GTX 1650 4GB', status: 'available', current_user_name: null, notes: 'Máy chuẩn phòng thực hành chung' },
  { id: 'M05', name: 'M05', room: 'C202', cpu: 'AMD Ryzen 7 5700X', ram: '32GB DDR4', gpu: 'RTX 3060 Ti', status: 'in_use', current_user_name: 'Trần Văn Bảo', notes: 'Đang làm bài tập môn Trí tuệ nhân tạo' },
  { id: 'M06', name: 'M06', room: 'C202', cpu: 'Intel Core i5-11400', ram: '8GB DDR4', gpu: 'Intel UHD 730', status: 'maintenance', current_user_name: null, notes: 'Đang bảo trì thay nguồn điện & vệ sinh tản nhiệt' }
];

export async function GET() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('computers').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    } catch (e) {}
  }
  return NextResponse.json({ success: true, count: FALLBACK_COMPUTERS.length, data: FALLBACK_COMPUTERS });
}

export async function POST(req) {
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

    if (supabase) {
      const { data, error } = await supabase.from('computers').insert([newComp]).select();
      if (!error && data) {
        return NextResponse.json({ success: true, message: 'Thêm máy tính thành công!', data: data[0] }, { status: 201 });
      }
    }

    return NextResponse.json({ success: true, message: 'Thêm máy tính thành công!', data: newComp }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
