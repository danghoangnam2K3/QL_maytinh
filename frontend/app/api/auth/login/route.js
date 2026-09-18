import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' }, { status: 400 });
    }

    let userProfile = null;
    if (supabase) {
      const { data } = await supabase.from('profiles').select('*').limit(1).single();
      if (data) {
        userProfile = {
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
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: 'jwt_token_session',
      user: userProfile
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

