const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Seed In-Memory Database
let db = {
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
  },
  computers: [
    {
      id: 'M04',
      name: 'M04',
      room: 'C201',
      cpu: 'Intel Core i7-13700',
      ram: '16GB DDR5',
      gpu: 'RTX 3060 12GB',
      status: 'available', // available | in_use | maintenance
      currentUser: null,
      notes: 'Máy hoạt động mượt mà, đầy đủ phần mềm thực hành'
    },
    {
      id: 'M03',
      name: 'M03',
      room: 'C201',
      cpu: 'Intel Core i5-13400',
      ram: '16GB DDR4',
      gpu: 'GTX 1660 Super',
      status: 'available',
      currentUser: null,
      notes: 'Đã cập nhật Visual Studio 2022 và Docker'
    },
    {
      id: 'M02',
      name: 'M02',
      room: 'C201',
      cpu: 'Intel Core i7-12700',
      ram: '32GB DDR4',
      gpu: 'RTX 3070 8GB',
      status: 'available',
      currentUser: null,
      notes: 'Cấu hình đồ hoạ & AI/ML'
    },
    {
      id: 'M01',
      name: 'M01',
      room: 'C201',
      cpu: 'Intel Core i5-12400',
      ram: '16GB DDR4',
      gpu: 'GTX 1650 4GB',
      status: 'available',
      currentUser: null,
      notes: 'Máy chuẩn phòng thực hành chung'
    },
    {
      id: 'M05',
      name: 'M05',
      room: 'C202',
      cpu: 'AMD Ryzen 7 5700X',
      ram: '32GB DDR4',
      gpu: 'RTX 3060 Ti',
      status: 'in_use',
      currentUser: 'Trần Văn Bảo',
      notes: 'Đang làm bài tập môn Trí tuệ nhân tạo'
    },
    {
      id: 'M06',
      name: 'M06',
      room: 'C202',
      cpu: 'Intel Core i5-11400',
      ram: '8GB DDR4',
      gpu: 'Intel UHD 730',
      status: 'maintenance',
      currentUser: null,
      notes: 'Đang bảo trì thay nguồn điện & vệ sinh tản nhiệt'
    }
  ],
  requests: [
    {
      id: 'REQ-101',
      computerId: 'M01',
      computerName: 'M01',
      requester: 'Nguyễn Thanh Tùng',
      requesterId: 'SV2021001',
      reason: 'Làm bài tập lớn Kiến trúc máy tính',
      duration: '2 giờ',
      createdAt: '2026-09-18 19:15',
      status: 'approved' // pending | approved | rejected
    },
    {
      id: 'REQ-102',
      computerId: 'M04',
      computerName: 'M04',
      requester: 'Đặng Mai Phương',
      requesterId: 'SV2021045',
      reason: 'Demo đồ án Tốt nghiệp chuyên ngành',
      duration: '4 giờ',
      createdAt: '2026-09-18 20:30',
      status: 'pending'
    },
    {
      id: 'REQ-103',
      computerId: 'M02',
      computerName: 'M02',
      requester: 'Lê Quốc Hưng',
      requesterId: 'SV2021088',
      reason: 'Không có lý do rõ ràng',
      duration: '1 giờ',
      createdAt: '2026-09-18 18:00',
      status: 'rejected'
    }
  ]
};

// API: Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
  }
  // Allow any valid demo credential or test
  return res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    token: 'jwt_mock_token_qlpl_2026',
    user: db.user
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, user: db.user });
});

// API: Stats
app.get('/api/stats', (req, res) => {
  const total = db.computers.length;
  const available = db.computers.filter(c => c.status === 'available').length;
  const inUse = db.computers.filter(c => c.status === 'in_use').length;
  const maintenance = db.computers.filter(c => c.status === 'maintenance').length;
  const pendingRequests = db.requests.filter(r => r.status === 'pending').length;

  res.json({
    success: true,
    data: {
      userCount: 42,
      totalComputers: total,
      inUseComputers: inUse,
      availableComputers: available,
      maintenanceComputers: maintenance,
      pendingRequests,
      totalUsageHours: '128.5h',
      statusCounts: {
        available,
        inUse,
        maintenance
      },
      hourlyUsage: [
        { time: '07:00', count: 1 },
        { time: '09:00', count: 4 },
        { time: '11:00', count: 5 },
        { time: '13:00', count: 3 },
        { time: '15:00', count: 6 },
        { time: '17:00', count: 4 },
        { time: '19:00', count: 2 },
        { time: '21:00', count: 1 }
      ]
    }
  });
});

// API: Computers CRUD
app.get('/api/computers', (req, res) => {
  const { status, room, search } = req.query;
  let results = [...db.computers];
  
  if (status && status !== 'all') {
    results = results.filter(c => c.status === status);
  }
  if (room && room !== 'all') {
    results = results.filter(c => c.room.toLowerCase() === room.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.room.toLowerCase().includes(q) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

app.post('/api/computers', (req, res) => {
  const { id, name, room, cpu, ram, gpu, status, notes } = req.body;
  if (!name || !room) {
    return res.status(400).json({ success: false, message: 'Tên máy và phòng không được để trống!' });
  }

  const newId = id || name.toUpperCase();
  const existing = db.computers.find(c => c.id.toLowerCase() === newId.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: `Máy tính mã ${newId} đã tồn tại!` });
  }

  const newComputer = {
    id: newId,
    name: name.toUpperCase(),
    room: room || 'C201',
    cpu: cpu || 'Intel Core i5',
    ram: ram || '16GB',
    gpu: gpu || 'Standard GPU',
    status: status || 'available',
    currentUser: null,
    notes: notes || 'Vừa được thêm vào hệ thống'
  };

  db.computers.unshift(newComputer);
  res.status(201).json({ success: true, message: 'Thêm máy tính thành công!', data: newComputer });
});

app.put('/api/computers/:id', (req, res) => {
  const { id } = req.params;
  const index = db.computers.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy máy tính này!' });
  }

  db.computers[index] = { ...db.computers[index], ...req.body, id: db.computers[index].id };
  res.json({ success: true, message: 'Cập nhật máy tính thành công!', data: db.computers[index] });
});

app.delete('/api/computers/:id', (req, res) => {
  const { id } = req.params;
  const index = db.computers.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy máy tính cần xoá!' });
  }

  const removed = db.computers.splice(index, 1);
  res.json({ success: true, message: `Đã xoá máy ${id} thành công!`, data: removed[0] });
});

// API: Borrow Requests
app.get('/api/requests', (req, res) => {
  res.json({ success: true, count: db.requests.length, data: db.requests });
});

app.post('/api/requests', (req, res) => {
  const { computerId, reason, duration, requesterName } = req.body;
  if (!computerId) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn máy tính muốn mượn!' });
  }

  const computer = db.computers.find(c => c.id.toLowerCase() === computerId.toLowerCase());
  if (!computer) {
    return res.status(404).json({ success: false, message: 'Máy tính không tồn tại!' });
  }
  if (computer.status !== 'available') {
    return res.status(400).json({ success: false, message: 'Máy này hiện không có sẵn để mượn!' });
  }

  const newRequest = {
    id: 'REQ-' + Math.floor(100 + Math.random() * 900),
    computerId: computer.id,
    computerName: computer.name,
    requester: requesterName || db.user.fullName,
    requesterId: db.user.studentId,
    reason: reason || 'Thực hành môn học',
    duration: duration || '2 giờ',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'pending'
  };

  db.requests.unshift(newRequest);
  res.status(201).json({ success: true, message: 'Gửi yêu cầu mượn máy thành công! Đang chờ duyệt.', data: newRequest });
});

app.put('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // approved | rejected | pending

  const request = db.requests.find(r => r.id === id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu!' });
  }

  request.status = status;

  // If approved, update computer status to in_use
  const comp = db.computers.find(c => c.id === request.computerId);
  if (comp) {
    if (status === 'approved') {
      comp.status = 'in_use';
      comp.currentUser = request.requester;
    } else if (status === 'rejected' || status === 'completed') {
      if (comp.currentUser === request.requester) {
        comp.status = 'available';
        comp.currentUser = null;
      }
    }
  }

  res.json({ success: true, message: `Đã cập nhật trạng thái yêu cầu sang "${status}"`, data: request });
});

// API: Profile
app.get('/api/profile', (req, res) => {
  res.json({ success: true, data: db.user });
});

app.put('/api/profile', (req, res) => {
  const { fullName, studentId, classRoom, gender, phone, email, avatar } = req.body;
  db.user = {
    ...db.user,
    fullName: fullName || db.user.fullName,
    studentId: studentId || db.user.studentId,
    classRoom: classRoom || db.user.classRoom,
    gender: gender || db.user.gender,
    phone: phone || db.user.phone,
    email: email || db.user.email,
    avatar: avatar || db.user.avatar
  };

  res.json({ success: true, message: 'Lưu thay đổi hồ sơ thành công!', data: db.user });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`QLPL Server running at http://localhost:${PORT}`);
});
