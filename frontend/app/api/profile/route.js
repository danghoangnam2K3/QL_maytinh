import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình Supabase.',
      data: null
    });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: error ? error.message : 'Chưa có hồ sơ', data: null }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
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
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message, data: null }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!supabase) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình Supabase để cập nhật hồ sơ.'
    }, { status: 503 });
  }

  try {
    const body = await req.json();
    const updatePayload = {};
    if (body.fullName !== undefined) updatePayload.full_name = body.fullName;
    if (body.studentId !== undefined) updatePayload.student_id = body.studentId;
    if (body.classRoom !== undefined) updatePayload.class_room = body.classRoom;
    if (body.gender !== undefined) updatePayload.gender = body.gender;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.avatar !== undefined) updatePayload.avatar_url = body.avatar;

    let query = supabase.from('profiles').update(updatePayload);
    if (body.id) {
      query = query.eq('id', body.id);
    } else {
      const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).single();
      if (firstProfile?.id) {
        query = query.eq('id', firstProfile.id);
      } else {
        query = query.eq('student_id', 'NV0001171');
      }
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lưu thay đổi hồ sơ vào Supabase thành công!',
      data: data ? data[0] : updatePayload
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
