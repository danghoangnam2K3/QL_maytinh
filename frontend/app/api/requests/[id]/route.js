import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (supabase) {
      await supabase.from('borrow_requests').update({ status }).eq('id', id);
    }
    return NextResponse.json({ success: true, message: `Đã cập nhật trạng thái yêu cầu sang "${status}"` });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
