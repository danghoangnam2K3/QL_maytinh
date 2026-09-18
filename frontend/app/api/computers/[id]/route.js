import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (supabase) {
      await supabase.from('computers').update(body).eq('id', id);
    }
    return NextResponse.json({ success: true, message: 'Cập nhật máy tính thành công!' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (supabase) {
      await supabase.from('computers').delete().eq('id', id);
    }
    return NextResponse.json({ success: true, message: `Đã xoá máy ${id} thành công!` });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
