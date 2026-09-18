-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG MÁY TÍNH (QLPL) - SUPABASE DATABASE SCHEMA
-- Hệ quản trị CSDL: PostgreSQL (Supabase Compatible)
-- Cách sử dụng: Mở Supabase Dashboard -> Vào mục "SQL Editor" -> Dán toàn bộ nội dung file này và bấm "Run"
-- ==============================================================================

-- 1. KÍCH HOẠT EXTENSION HỖ TRỢ UUID (NẾU CHƯA CÓ)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TẠO BẢNG NGƯỜI DÙNG / HỒ SƠ CÁ NHÂN (profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE NOT NULL,       -- MSSV (ví dụ: NV0001171)
    full_name VARCHAR(100) NOT NULL,              -- Họ và tên
    class_room VARCHAR(50) DEFAULT 'KCT',         -- Lớp học
    gender VARCHAR(20) DEFAULT 'Nam',             -- Giới tính (Nam, Nữ, Khác)
    phone VARCHAR(20),                            -- Số điện thoại
    email VARCHAR(150) UNIQUE NOT NULL,           -- Email
    role VARCHAR(50) DEFAULT 'Quản trị viên',     -- Vai trò (Quản trị viên, Sinh viên, Giảng viên)
    status VARCHAR(20) DEFAULT 'ACTIVE',          -- Trạng thái (ACTIVE, INACTIVE)
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 3. TẠO BẢNG DANH SÁCH MÁY TÍNH (computers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.computers (
    id VARCHAR(20) PRIMARY KEY,                   -- Mã máy (M01, M02, M03, M04...)
    name VARCHAR(50) NOT NULL,                    -- Tên máy hiển thị
    room VARCHAR(50) NOT NULL DEFAULT 'C201',     -- Phòng thực hành (C201, C202...)
    cpu VARCHAR(100) DEFAULT 'Intel Core i5',     -- Cấu hình CPU
    ram VARCHAR(50) DEFAULT '16GB DDR4',          -- Cấu hình RAM
    gpu VARCHAR(100) DEFAULT 'NVIDIA GPU',        -- Cấu hình Card đồ họa
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
    current_user_name VARCHAR(100) DEFAULT NULL,  -- Người hiện đang sử dụng máy
    notes TEXT,                                   -- Ghi chú phần mềm, tình trạng máy
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 4. TẠO BẢNG YÊU CẦU MƯỢN MÁY (borrow_requests)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.borrow_requests (
    id VARCHAR(30) PRIMARY KEY,                   -- Mã yêu cầu (REQ-101, REQ-102...)
    computer_id VARCHAR(20) REFERENCES public.computers(id) ON DELETE CASCADE,
    computer_name VARCHAR(50) NOT NULL,
    requester VARCHAR(100) NOT NULL,              -- Họ tên người yêu cầu
    requester_id VARCHAR(50) NOT NULL,            -- MSSV người yêu cầu
    reason TEXT NOT NULL,                         -- Lý do mượn máy
    duration VARCHAR(50) DEFAULT '2 giờ',         -- Thời lượng mượn
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 5. TẠO BẢNG THỐNG KÊ GIỜ SỬ DỤNG THEO MÁY (usage_logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id BIGSERIAL PRIMARY KEY,
    computer_id VARCHAR(20) REFERENCES public.computers(id) ON DELETE CASCADE,
    time_slot VARCHAR(10) NOT NULL,               -- Khung giờ (07:00, 09:00, 11:00...)
    load_percentage INT DEFAULT 0,                -- Tỷ lệ tải / sử dụng (0 - 100%)
    recorded_date DATE DEFAULT CURRENT_DATE
);

-- ==============================================================================
-- 6. TỰ ĐỘNG CẬP NHẬT CỘT updated_at BẰNG TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_computers_updated_at ON public.computers;
CREATE TRIGGER set_computers_updated_at
BEFORE UPDATE ON public.computers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_borrow_requests_updated_at ON public.borrow_requests;
CREATE TRIGGER set_borrow_requests_updated_at
BEFORE UPDATE ON public.borrow_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. CẤU HÌNH ROW LEVEL SECURITY (RLS) & POLICIES CHO SUPABASE
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai hoặc qua anon key cho web demo
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Computers" ON public.computers FOR SELECT USING (true);
CREATE POLICY "Public Insert Computers" ON public.computers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Computers" ON public.computers FOR UPDATE USING (true);
CREATE POLICY "Public Delete Computers" ON public.computers FOR DELETE USING (true);

CREATE POLICY "Public Read Requests" ON public.borrow_requests FOR SELECT USING (true);
CREATE POLICY "Public Insert Requests" ON public.borrow_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Requests" ON public.borrow_requests FOR UPDATE USING (true);

CREATE POLICY "Public Read Usage Logs" ON public.usage_logs FOR SELECT USING (true);

-- ==============================================================================
-- 8. NẠP DỮ LIỆU MẪU BAN ĐẦU (SEED DATA CHUẨN THEO ẢNH CHỤP)
-- ==============================================================================

-- 8.1. Dữ liệu tài khoản quản trị
INSERT INTO public.profiles (student_id, full_name, class_room, gender, phone, email, role, status, avatar_url)
VALUES (
    'NV0001171',
    'Hồ Ngọc Hoàng Long',
    'KCT',
    'Nam',
    '0987654321',
    'longho.swe@gmail.com',
    'Quản trị viên',
    'ACTIVE',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
) ON CONFLICT (student_id) DO NOTHING;

-- 8.2. Dữ liệu danh sách máy tính phòng thực hành
INSERT INTO public.computers (id, name, room, cpu, ram, gpu, status, current_user_name, notes)
VALUES 
    ('M04', 'M04', 'C201', 'Intel Core i7-13700', '16GB DDR5', 'RTX 3060 12GB', 'available', NULL, 'Máy hoạt động mượt mà, đầy đủ phần mềm thực hành'),
    ('M03', 'M03', 'C201', 'Intel Core i5-13400', '16GB DDR4', 'GTX 1660 Super', 'available', NULL, 'Đã cập nhật Visual Studio 2022 và Docker'),
    ('M02', 'M02', 'C201', 'Intel Core i7-12700', '32GB DDR4', 'RTX 3070 8GB', 'available', NULL, 'Cấu hình đồ hoạ & AI/ML'),
    ('M01', 'M01', 'C201', 'Intel Core i5-12400', '16GB DDR4', 'GTX 1650 4GB', 'available', NULL, 'Máy chuẩn phòng thực hành chung'),
    ('M05', 'M05', 'C202', 'AMD Ryzen 7 5700X', '32GB DDR4', 'RTX 3060 Ti', 'in_use', 'Trần Văn Bảo', 'Đang làm bài tập môn Trí tuệ nhân tạo'),
    ('M06', 'M06', 'C202', 'Intel Core i5-11400', '8GB DDR4', 'Intel UHD 730', 'maintenance', NULL, 'Đang bảo trì thay nguồn điện & vệ sinh tản nhiệt')
ON CONFLICT (id) DO UPDATE SET 
    room = EXCLUDED.room,
    cpu = EXCLUDED.cpu,
    ram = EXCLUDED.ram,
    gpu = EXCLUDED.gpu,
    status = EXCLUDED.status,
    current_user_name = EXCLUDED.current_user_name,
    notes = EXCLUDED.notes;

-- 8.3. Dữ liệu các yêu cầu mượn máy
INSERT INTO public.borrow_requests (id, computer_id, computer_name, requester, requester_id, reason, duration, status)
VALUES
    ('REQ-101', 'M01', 'M01', 'Nguyễn Thanh Tùng', 'SV2021001', 'Làm bài tập lớn Kiến trúc máy tính', '2 giờ', 'approved'),
    ('REQ-102', 'M04', 'M04', 'Đặng Mai Phương', 'SV2021045', 'Demo đồ án Tốt nghiệp chuyên ngành', '4 giờ', 'pending'),
    ('REQ-103', 'M02', 'M02', 'Lê Quốc Hưng', 'SV2021088', 'Không có lý do rõ ràng', '1 giờ', 'rejected')
ON CONFLICT (id) DO NOTHING;

-- 8.4. Dữ liệu biểu đồ sử dụng máy theo giờ
INSERT INTO public.usage_logs (computer_id, time_slot, load_percentage)
VALUES 
    ('M01', '07:00', 30),
    ('M02', '09:00', 85),
    ('M03', '11:00', 95),
    ('M04', '13:00', 50),
    ('M05', '15:00', 90),
    ('M06', '17:00', 75),
    ('M01', '19:00', 40),
    ('M04', '21:00', 20);

-- Thông báo hoàn tất
SELECT 'Khởi tạo cơ sở dữ liệu Supabase cho QLPL thành công!' AS result;
