import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

let cachedProfile = {
  fullName: 'Hồ Ngọc Hoàng Long',
  studentId: 'NV0001171',
  classRoom: 'KCT',
  gender: 'Nam',
  phone: '0987654321',
  email: 'longho.swe@gmail.com',
  role: 'Quản trị viên',
  status: 'ACTIVE',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
};

export async function GET() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            fullName: data.full_name,
            studentId: data.student_id,
            classRoom: data.class_room,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            role: data.role,
            status: data.status,
            avatar: data.avatar_url
          }
        });
      }
    } catch (e) {}
  }
  return NextResponse.json({ success: true, data: cachedProfile });
}

export async function PUT(req) {
  try {
    const body = await req.json();
    cachedProfile = { ...cachedProfile, ...body };

    if (supabase) {
      await supabase.from('profiles').update({
        full_name: body.fullName,
        student_id: body.studentId,
        class_room: body.classRoom,
        gender: body.gender,
        phone: body.phone,
        email: body.email,
        avatar_url: body.avatar
      }).eq('student_id', body.studentId || 'NV0001171');
    }

    return NextResponse.json({ success: true, message: 'Lưu thay đổi hồ sơ thành công!', data: cachedProfile });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
