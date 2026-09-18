import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: 'jwt_mock_token_vercel',
      user: {
        id: 'user-001',
        fullName: 'Hồ Ngọc Hoàng Long',
        studentId: 'NV0001171',
        classRoom: 'KCT',
        gender: 'Nam',
        phone: '0987654321',
        email: 'longho.swe@gmail.com',
        role: 'Quản trị viên',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
