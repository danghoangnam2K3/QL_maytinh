"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Monitor,
  FileCode2,
  User,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Laptop,
  Check,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Server,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Cpu,
  HardDrive
} from "lucide-react";

// Default Mock Data
const INITIAL_USER = {
  fullName: "Hồ Ngọc Hoàng Long",
  studentId: "NV0001171",
  classRoom: "KCT",
  gender: "Nam",
  phone: "0987654321",
  email: "longho.swe@gmail.com",
  role: "Quản trị viên",
  status: "ACTIVE",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
};

const INITIAL_COMPUTERS = [
  {
    id: "M04",
    name: "M04",
    room: "C201",
    cpu: "Intel Core i7-13700",
    ram: "16GB DDR5",
    gpu: "RTX 3060 12GB",
    status: "available",
    currentUser: null,
    notes: "Máy hoạt động mượt mà, đầy đủ phần mềm thực hành"
  },
  {
    id: "M03",
    name: "M03",
    room: "C201",
    cpu: "Intel Core i5-13400",
    ram: "16GB DDR4",
    gpu: "GTX 1660 Super",
    status: "available",
    currentUser: null,
    notes: "Đã cập nhật Visual Studio 2022 và Docker"
  },
  {
    id: "M02",
    name: "M02",
    room: "C201",
    cpu: "Intel Core i7-12700",
    ram: "32GB DDR4",
    gpu: "RTX 3070 8GB",
    status: "available",
    currentUser: null,
    notes: "Cấu hình đồ hoạ & AI/ML"
  },
  {
    id: "M01",
    name: "M01",
    room: "C201",
    cpu: "Intel Core i5-12400",
    ram: "16GB DDR4",
    gpu: "GTX 1650 4GB",
    status: "available",
    currentUser: null,
    notes: "Máy chuẩn phòng thực hành chung"
  },
  {
    id: "M05",
    name: "M05",
    room: "C202",
    cpu: "AMD Ryzen 7 5700X",
    ram: "32GB DDR4",
    gpu: "RTX 3060 Ti",
    status: "in_use",
    currentUser: "Trần Văn Bảo",
    notes: "Đang làm bài tập môn Trí tuệ nhân tạo"
  },
  {
    id: "M06",
    name: "M06",
    room: "C202",
    cpu: "Intel Core i5-11400",
    ram: "8GB DDR4",
    gpu: "Intel UHD 730",
    status: "maintenance",
    currentUser: null,
    notes: "Đang bảo trì thay nguồn điện & vệ sinh tản nhiệt"
  }
];

const INITIAL_REQUESTS = [
  {
    id: "REQ-101",
    computerId: "M01",
    computerName: "M01",
    requester: "Nguyễn Thanh Tùng",
    requesterId: "SV2021001",
    reason: "Làm bài tập lớn Kiến trúc máy tính",
    duration: "2 giờ",
    createdAt: "2026-09-18 19:15",
    status: "approved"
  },
  {
    id: "REQ-102",
    computerId: "M04",
    computerName: "M04",
    requester: "Đặng Mai Phương",
    requesterId: "SV2021045",
    reason: "Demo đồ án Tốt nghiệp chuyên ngành",
    duration: "4 giờ",
    createdAt: "2026-09-18 20:30",
    status: "pending"
  },
  {
    id: "REQ-103",
    computerId: "M02",
    computerName: "M02",
    requester: "Lê Quốc Hưng",
    requesterId: "SV2021088",
    reason: "Không có lý do rõ ràng",
    duration: "1 giờ",
    createdAt: "2026-09-18 18:00",
    status: "rejected"
  }
];

export default function Home() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState("dashboard"); // login, dashboard, computers, swagger, profile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // App Data State
  const [user, setUser] = useState(INITIAL_USER);
  const [computers, setComputers] = useState(INITIAL_COMPUTERS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("all");

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedComputerDetail, setSelectedComputerDetail] = useState(null);
  
  // Borrow form state
  const [borrowForm, setBorrowForm] = useState({
    computerId: "",
    reason: "",
    duration: "2 giờ"
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "admin",
    password: "••••••••",
    remember: true
  });
  const [showPassword, setShowPassword] = useState(false);

  // New Computer Form State
  const [newCompForm, setNewCompForm] = useState({
    name: "",
    room: "C201",
    cpu: "Intel Core i7-13700",
    ram: "16GB DDR5",
    gpu: "RTX 3060 12GB",
    status: "available",
    notes: ""
  });

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync with API
  const fetchBackendData = async () => {
    try {
      const resComps = await fetch("/api/computers");
      if (resComps.ok) {
        const dataComps = await resComps.json();
        if (dataComps.data) setComputers(dataComps.data);
      }
      const resReqs = await fetch("/api/requests");
      if (resReqs.ok) {
        const dataReqs = await resReqs.json();
        if (dataReqs.data) setRequests(dataReqs.data);
      }
      const resProfile = await fetch("/api/profile");
      if (resProfile.ok) {
        const dataProfile = await resProfile.json();
        if (dataProfile.data) setUser(dataProfile.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Computed metrics
  const availableCount = computers.filter(c => c.status === "available").length;
  const inUseCount = computers.filter(c => c.status === "in_use").length;
  const maintenanceCount = computers.filter(c => c.status === "maintenance").length;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;

  // Filtered computers list
  const filteredComputers = computers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cpu && c.cpu.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRoom = selectedRoomFilter === "all" || c.room.toLowerCase() === selectedRoomFilter.toLowerCase();
    return matchesSearch && matchesRoom;
  });

  // Handle Login
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch (err) {}
    setIsLoggedIn(true);
    setCurrentView("dashboard");
    showToast("Đăng nhập thành công! Chào mừng trở lại.");
  };

  // Handle Borrow Computer Request
  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!borrowForm.computerId) {
      showToast("Vui lòng chọn máy tính muốn mượn!", "error");
      return;
    }

    const comp = computers.find(c => c.id === borrowForm.computerId);
    if (!comp) return;

    const newReq = {
      id: "REQ-" + Math.floor(100 + Math.random() * 900),
      computerId: comp.id,
      computerName: comp.name,
      requester: user.fullName,
      requesterId: user.studentId,
      reason: borrowForm.reason || "Làm bài thực hành",
      duration: borrowForm.duration,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "pending"
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          computerId: comp.id,
          reason: newReq.reason,
          duration: newReq.duration,
          requesterName: user.fullName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(prev => [data.data, ...prev]);
        showToast("Gửi yêu cầu mượn máy thành công! Đang chờ duyệt.");
        setBorrowForm({ computerId: "", reason: "", duration: "2 giờ" });
        return;
      }
    } catch (e) {}

    setRequests(prev => [newReq, ...prev]);
    setBorrowForm({ computerId: "", reason: "", duration: "2 giờ" });
    showToast("Gửi yêu cầu mượn máy thành công! Đang chờ duyệt.");
  };

  // Handle Request Approval / Rejection
  const handleUpdateRequestStatus = async (reqId, newStatus) => {
    try {
      await fetch(`/api/requests/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}

    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));

    const req = requests.find(r => r.id === reqId);
    if (req) {
      if (newStatus === "approved") {
        setComputers(prev => prev.map(c => c.id === req.computerId ? { ...c, status: "in_use", currentUser: req.requester } : c));
        showToast(`Đã duyệt yêu cầu mượn máy ${req.computerName} cho ${req.requester}`);
      } else if (newStatus === "rejected") {
        setComputers(prev => prev.map(c => c.id === req.computerId && c.currentUser === req.requester ? { ...c, status: "available", currentUser: null } : c));
        showToast(`Đã từ chối yêu cầu của ${req.requester}`, "info");
      }
    }
  };

  // Handle Add New Computer
  const handleAddComputerSubmit = async (e) => {
    e.preventDefault();
    if (!newCompForm.name) {
      showToast("Vui lòng nhập tên máy!", "error");
      return;
    }

    const newComp = {
      id: newCompForm.name.toUpperCase().trim(),
      name: newCompForm.name.toUpperCase().trim(),
      room: newCompForm.room,
      cpu: newCompForm.cpu,
      ram: newCompForm.ram,
      gpu: newCompForm.gpu,
      status: newCompForm.status,
      currentUser: null,
      notes: newCompForm.notes || "Thiết bị mới bổ sung"
    };

    try {
      const res = await fetch("/api/computers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComp)
      });
      if (res.ok) {
        const data = await res.json();
        setComputers(prev => [data.data, ...prev]);
        setIsAddModalOpen(false);
        showToast(`Đã thêm máy ${newComp.name} vào hệ thống!`);
        return;
      }
    } catch (e) {}

    setComputers(prev => [newComp, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Đã thêm máy ${newComp.name} vào hệ thống!`);
  };

  // Handle Delete Computer
  const handleDeleteComputer = async (compId) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá máy ${compId} khỏi danh sách?`)) return;

    try {
      await fetch(`/api/computers/${compId}`, { method: "DELETE" });
    } catch (e) {}

    setComputers(prev => prev.filter(c => c.id !== compId));
    showToast(`Đã xoá máy ${compId} thành công!`, "info");
  };

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
    } catch (e) {}
    showToast("Đã lưu thay đổi hồ sơ cá nhân thành công!");
  };

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (Screenshot 1)
  // -------------------------------------------------------------
  if (currentView === "login" || !isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#080b13] relative overflow-hidden">
        {/* Ambient Radial Lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/18 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/12 rounded-full blur-[150px] pointer-events-none" />

        {/* Main Split Login Card */}
        <div className="w-full max-w-4xl rounded-3xl overflow-hidden obsidian-card grid grid-cols-1 md:grid-cols-12 min-h-[530px] shadow-2xl relative z-10 border border-white/15">
          
          {/* Left Column: Dark Gradient Hero Banner */}
          <div className="md:col-span-5 relative p-8 md:p-10 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#141d38] to-[#0c1222] border-b md:border-b-0 md:border-r border-white/15">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                QLPL DEMO
              </div>
            </div>

            <div className="relative z-10 my-8">
              <p className="text-indigo-200 text-sm font-semibold tracking-wide">
                Nice to see you again
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white mt-1.5 tracking-tight">
                WELCOME BACK
              </h1>
              <div className="w-16 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full mt-3 mb-4 shadow-md shadow-indigo-500/50" />
              <p className="text-slate-300 text-xs leading-relaxed">
                Hệ thống quản lý phòng thực hành & mượn máy tính thông minh. Giám sát thiết bị và phân bổ tài nguyên thời gian thực.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-indigo-200/80 font-medium">
              <span>Phiên bản 2.5 (Black Edition)</span>
              <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Server Online
              </span>
            </div>
          </div>

          {/* Right Column: Sleek Dark Login Form */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#0d1424]/95 backdrop-blur-xl">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-7">
                <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
                  ACCOUNT
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
                  Đăng nhập
                </h2>
                <p className="text-xs text-slate-400 mt-1.5">
                  Nhập thông tin tài khoản bên dưới để tiếp tục.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="Tên đăng nhập hoặc MSSV"
                    className="glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Nhập mật khẩu"
                      className="glass-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={loginForm.remember}
                      onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 w-4 h-4"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <span className="text-indigo-400 hover:text-indigo-300 transition font-semibold cursor-pointer">
                    Chưa có tài khoản?
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary-glow py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase mt-2"
                >
                  ĐĂNG NHẬP
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginForm({ username: "admin", password: "password123", remember: true });
                      handleLoginSubmit();
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Đăng nhập nhanh với quyền Quản Trị Viên (Demo)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // MAIN APPLICATION LAYOUT (Screenshot 2, 3, 4 with Refined Proportions)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080b13] text-slate-100 flex flex-col p-4 md:p-6 lg:p-8">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border border-indigo-500/50 bg-[#12192c]/95 backdrop-blur-2xl shadow-2xl shadow-indigo-500/40 text-white animate-bounce-short">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* 1. TOP NAVBAR (Floating Card with Rich Spacing) */}
      <header className="w-full obsidian-card px-6 py-4 mb-6 flex items-center justify-between shadow-2xl border border-white/15">
        
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => setCurrentView("dashboard")}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0d1324] rounded-[14px] flex items-center justify-center font-extrabold text-lg text-white">
                Q
              </div>
            </div>
            <div>
              <div className="text-[11px] tracking-widest uppercase text-indigo-400 font-extrabold leading-tight">
                WORKSPACE
              </div>
              <div className="text-base font-extrabold text-white tracking-wide">
                QLPL Demo <span className="text-xs text-slate-400 font-medium ml-1">Black Edition</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status badge & User Profile pill */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-xs font-bold text-emerald-400 shadow-md shadow-emerald-500/15">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>System online</span>
          </div>

          {/* User Profile pill */}
          <div
            onClick={() => setCurrentView("profile")}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/[0.06] border border-white/[0.15] hover:border-indigo-500/60 hover:bg-white/[0.1] transition cursor-pointer shadow-md"
          >
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/50"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {user.fullName}
              </span>
              <span className="text-[10px] text-indigo-300 font-medium">
                {user.role}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setCurrentView("login");
              showToast("Đã đăng xuất tài khoản", "info");
            }}
            title="Đăng xuất"
            className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.15] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition shadow-sm"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT: SIDEBAR + MAIN CANVAS */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT SIDEBAR (Sticky, Natural Height, No Infinite Void) */}
        <aside
          className={`fixed md:sticky top-6 z-30 w-full md:w-64 lg:w-72 obsidian-card p-5 flex flex-col justify-between shrink-0 transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-[110%] md:translate-x-0"
          }`}
        >
          <div className="space-y-4">
            <div className="text-xs font-extrabold tracking-wider text-slate-400 uppercase px-3">
              NAVIGATION
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => { setCurrentView("dashboard"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition ${
                  currentView === "dashboard"
                    ? "bg-gradient-to-r from-indigo-600/35 to-indigo-500/15 border border-indigo-500/50 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Trang chủ</span>
              </button>

              <button
                onClick={() => { setCurrentView("computers"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition ${
                  currentView === "computers"
                    ? "bg-gradient-to-r from-indigo-600/35 to-indigo-500/15 border border-indigo-500/50 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Monitor className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Quản lý máy tính</span>
                <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold">
                  {computers.length}
                </span>
              </button>

              <button
                onClick={() => { setCurrentView("swagger"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition ${
                  currentView === "swagger"
                    ? "bg-gradient-to-r from-indigo-600/35 to-indigo-500/15 border border-indigo-500/50 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <FileCode2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Swagger API</span>
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  REST
                </span>
              </button>

              <button
                onClick={() => { setCurrentView("profile"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition ${
                  currentView === "profile"
                    ? "bg-gradient-to-r from-indigo-600/35 to-indigo-500/15 border border-indigo-500/50 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <User className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Hồ sơ</span>
              </button>
            </nav>
          </div>

          {/* Bottom Role Card (Matching Screenshot "Vai trò: Quản trị viên") */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-600/5 border border-amber-500/40 flex items-center gap-3 shadow-md shadow-amber-500/10">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-amber-300">Vai trò: {user.role}</div>
                <div className="text-[11px] text-amber-400/80">Toàn quyền hệ thống</div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView("login")}
              className="w-full text-center py-2 text-xs font-medium text-slate-400 hover:text-indigo-300 transition"
            >
              Xem trang Đăng nhập (Auth)
            </button>
          </div>
        </aside>

        {/* MAIN DISPLAY CANVAS */}
        <main className="flex-1 min-w-0 w-full flex flex-col space-y-6">
          
          {/* ============================================================== */}
          {/* VIEW: DASHBOARD (Screenshot 2) */}
          {/* ============================================================== */}
          {currentView === "dashboard" && (
            <div className="space-y-6">
              
              {/* Header Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Tổng quan hệ thống phòng máy và người dùng
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-400 font-semibold">Trạng thái:</span>
                  <span className="badge-available">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Hoạt động bình thường
                  </span>
                </div>
              </div>

              {/* 4 TOP KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* 1. Người dùng */}
                <div className="obsidian-card-hover p-6 lg:p-7 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Người dùng</span>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white mt-2.5 tracking-tight">42</div>
                    <p className="text-xs text-slate-400 mt-2">Tổng số tài khoản đăng ký</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-xl shadow-indigo-500/25">
                    <Users className="w-7 h-7" />
                  </div>
                </div>

                {/* 2. Máy tính */}
                <div className="obsidian-card-hover p-6 lg:p-7 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Máy tính</span>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white mt-2.5 tracking-tight">{computers.length}</div>
                    <p className="text-xs text-slate-400 mt-2">Tổng số máy hiện có</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-xl shadow-purple-500/25">
                    <Monitor className="w-7 h-7" />
                  </div>
                </div>

                {/* 3. Máy đang dùng */}
                <div className="obsidian-card-hover p-6 lg:p-7 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Máy đang dùng</span>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white mt-2.5 tracking-tight">{inUseCount}</div>
                    <p className="text-xs text-slate-400 mt-2">Máy đang được sử dụng</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-xl shadow-amber-500/25">
                    <Laptop className="w-7 h-7" />
                  </div>
                </div>

                {/* 4. Tổng thời gian */}
                <div className="obsidian-card-hover p-6 lg:p-7 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng thời gian</span>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white mt-2.5 tracking-tight">128.5h</div>
                    <p className="text-xs text-slate-400 mt-2">Tổng thời gian đã sử dụng</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-xl shadow-emerald-500/25">
                    <Clock className="w-7 h-7" />
                  </div>
                </div>

              </div>

              {/* 2 MAIN LOWER PANELS: MÁY THEO TRẠNG THÁI & BIỂU ĐỒ THỜI GIAN THỰC */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Panel: Máy theo trạng thái (5 cols) */}
                <div className="xl:col-span-5 obsidian-card p-6 lg:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-extrabold text-white tracking-tight">
                          Máy theo trạng thái
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Phân bổ thiết bị trong phòng lab</p>
                      </div>
                      <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/15">
                        {computers.length} TOTAL
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Có sẵn */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/50 transition">
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <span className="flex items-center gap-2.5 font-bold text-white">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                            Có sẵn
                          </span>
                          <span className="font-extrabold text-emerald-400 text-sm">{availableCount} máy ({computers.length ? Math.round((availableCount / computers.length) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-md shadow-emerald-500/50"
                            style={{ width: `${computers.length ? (availableCount / computers.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Đang sử dụng */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/50 transition">
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <span className="flex items-center gap-2.5 font-bold text-white">
                            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                            Đang sử dụng
                          </span>
                          <span className="font-extrabold text-amber-400 text-sm">{inUseCount} máy ({computers.length ? Math.round((inUseCount / computers.length) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-md shadow-amber-500/50"
                            style={{ width: `${computers.length ? (inUseCount / computers.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Bảo trì */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-rose-500/50 transition">
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <span className="flex items-center gap-2.5 font-bold text-white">
                            <span className="w-3 h-3 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
                            Bảo trì
                          </span>
                          <span className="font-extrabold text-rose-400 text-sm">{maintenanceCount} máy ({computers.length ? Math.round((maintenanceCount / computers.length) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all duration-500 shadow-md shadow-rose-500/50"
                            style={{ width: `${computers.length ? (maintenanceCount / computers.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Breakdown Footer */}
                  <div className="mt-8 pt-5 border-t border-white/10 grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <div className="text-[11px] text-slate-400">Phòng C201</div>
                      <div className="text-sm font-bold text-white mt-0.5">4 máy (100% OK)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <div className="text-[11px] text-slate-400">Phòng C202</div>
                      <div className="text-sm font-bold text-white mt-0.5">2 máy (1 Đang dùng)</div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Thời gian sử dụng theo máy (7 cols) */}
                <div className="xl:col-span-7 obsidian-card p-6 lg:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-extrabold text-white tracking-tight">
                          Thời gian sử dụng theo máy
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Biểu đồ giám sát tải phòng máy thời gian thực</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-slate-400 font-medium">Cao điểm: <strong className="text-indigo-400">11:00 (95%)</strong></span>
                        <span className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          LIVE
                        </span>
                      </div>
                    </div>

                    {/* Rich Interactive Neon Bar Chart */}
                    <div className="relative h-72 w-full flex items-end justify-between gap-3 pt-8 pb-3 px-4 bg-[#080d1a] rounded-2xl border border-white/10 mt-4 shadow-inner">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                        <div className="border-b border-dashed border-slate-500 w-full" />
                        <div className="border-b border-dashed border-slate-500 w-full" />
                        <div className="border-b border-dashed border-slate-500 w-full" />
                      </div>

                      {[
                        { time: "07:00", val: 30, label: "M01" },
                        { time: "09:00", val: 85, label: "M02" },
                        { time: "11:00", val: 95, label: "M03" },
                        { time: "13:00", val: 50, label: "M04" },
                        { time: "15:00", val: 90, label: "M05" },
                        { time: "17:00", val: 75, label: "M06" },
                        { time: "19:00", val: 40, label: "M01" },
                        { time: "21:00", val: 20, label: "M04" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 group relative z-10">
                          {/* Tooltip on Hover */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-indigo-950 border border-indigo-500/60 text-xs text-white px-3 py-1 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none z-20">
                            {item.label}: {item.val}% tải
                          </div>

                          {/* Bar */}
                          <div className="w-full max-w-[42px] h-48 bg-slate-800/80 rounded-t-xl flex items-end overflow-hidden">
                            <div
                              className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 group-hover:brightness-125 transition-all duration-300 shadow-lg shadow-indigo-500/40"
                              style={{ height: `${item.val}%` }}
                            />
                          </div>

                          {/* Time label */}
                          <span className="text-xs text-slate-400 group-hover:text-indigo-300 font-mono font-bold">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                    <span className="flex items-center gap-2 font-medium">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      Cập nhật tự động mỗi 5 giây
                    </span>
                    <button
                      onClick={() => showToast("Đã làm mới dữ liệu biểu đồ!")}
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Làm mới
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: QUẢN LÝ MÁY TÍNH (Screenshot 3) */}
          {/* ============================================================== */}
          {currentView === "computers" && (
            <div className="space-y-6">
              {/* Header with Title and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
                    OPERATIONS
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    Quản lý máy tính
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Theo dõi phòng máy, trạng thái hoạt động và xử lý yêu cầu mượn trong thời gian thực.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary-glow px-6 py-3.5 text-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm máy mới</span>
                </button>
              </div>

              {/* TOP 4 SUMMARY METRIC STRIP */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="obsidian-card p-5 border-l-4 border-l-emerald-500">
                  <div className="text-xs font-bold uppercase text-emerald-400 tracking-wider">MÁY CÓ SẴN</div>
                  <div className="text-3xl font-extrabold text-white mt-1.5">{availableCount}</div>
                </div>

                <div className="obsidian-card p-5 border-l-4 border-l-amber-500">
                  <div className="text-xs font-bold uppercase text-amber-400 tracking-wider">ĐANG SỬ DỤNG</div>
                  <div className="text-3xl font-extrabold text-white mt-1.5">{inUseCount}</div>
                </div>

                <div className="obsidian-card p-5 border-l-4 border-l-rose-500">
                  <div className="text-xs font-bold uppercase text-rose-400 tracking-wider">BẢO TRÌ</div>
                  <div className="text-3xl font-extrabold text-white mt-1.5">{maintenanceCount}</div>
                </div>

                <div className="obsidian-card p-5 border-l-4 border-l-cyan-500">
                  <div className="text-xs font-bold uppercase text-cyan-400 tracking-wider">YÊU CẦU CHỜ</div>
                  <div className="text-3xl font-extrabold text-white mt-1.5">{pendingRequestsCount}</div>
                </div>
              </div>

              {/* MAIN CONTENT SPLIT: LEFT LIST (M04, M03, M02, M01...) & RIGHT FORM (Đăng ký mượn máy) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Danh sách máy trong phòng (7 cols) */}
                <div className="lg:col-span-7 obsidian-card p-6 lg:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h2 className="text-lg font-bold text-white">Danh sách máy trong phòng</h2>
                      <p className="text-xs text-slate-400">Tổng quan trạng thái từng thiết bị</p>
                    </div>

                    {/* Filter & Search */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Tìm mã máy..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="glass-input pl-9 py-2 text-xs w-36 sm:w-48"
                        />
                      </div>
                      <select
                        value={selectedRoomFilter}
                        onChange={(e) => setSelectedRoomFilter(e.target.value)}
                        className="glass-input py-2 text-xs w-28 font-medium"
                      >
                        <option value="all">Tất cả phòng</option>
                        <option value="C201">Phòng C201</option>
                        <option value="C202">Phòng C202</option>
                      </select>
                    </div>
                  </div>

                  {/* List of Machines */}
                  <div className="space-y-3.5">
                    {filteredComputers.map((comp) => (
                      <div
                        key={comp.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/50 hover:bg-white/[0.05] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/40 flex flex-col items-center justify-center shrink-0 shadow-md">
                            <span className="text-sm font-extrabold text-indigo-400">M</span>
                            <span className="text-[10px] text-slate-400 font-mono leading-none">{comp.name}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-base font-bold text-white">{comp.name}</span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-bold">
                                {comp.room}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                              <span>{comp.cpu}</span> • <span>{comp.ram}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                          {comp.status === "available" && (
                            <span className="badge-available">Có sẵn</span>
                          )}
                          {comp.status === "in_use" && (
                            <span className="badge-in-use">Đang dùng</span>
                          )}
                          {comp.status === "maintenance" && (
                            <span className="badge-maintenance">Bảo trì</span>
                          )}

                          <button
                            onClick={() => setSelectedComputerDetail(comp)}
                            className="btn-secondary-glow text-xs"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => {
                              const newNotes = prompt(`Sửa ghi chú cho máy ${comp.name}:`, comp.notes || "");
                              if (newNotes !== null) {
                                setComputers(prev => prev.map(c => c.id === comp.id ? { ...c, notes: newNotes } : c));
                                showToast(`Đã cập nhật máy ${comp.name}`);
                              }
                            }}
                            className="btn-secondary-glow text-xs"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteComputer(comp.id)}
                            className="px-3 py-2 text-xs rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-semibold transition"
                          >
                            Xoá
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Đăng ký mượn máy (5 cols) */}
                <div className="lg:col-span-5 obsidian-card p-6 lg:p-7 space-y-5">
                  <div className="pb-3 border-b border-white/10">
                    <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
                      REQUEST
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1">
                      Đăng ký mượn máy
                    </h2>
                  </div>

                  <form onSubmit={handleBorrowSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Chọn máy
                      </label>
                      <select
                        value={borrowForm.computerId}
                        onChange={(e) => setBorrowForm({ ...borrowForm, computerId: e.target.value })}
                        required
                        className="glass-input"
                      >
                        <option value="">-- Chọn máy khả dụng --</option>
                        {computers
                          .filter(c => c.status === "available")
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.room} - {c.cpu})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Lý do mượn
                      </label>
                      <textarea
                        rows={4}
                        value={borrowForm.reason}
                        onChange={(e) => setBorrowForm({ ...borrowForm, reason: e.target.value })}
                        placeholder="Ví dụ: cần làm bài tập, demo, hoặc thực hành..."
                        className="glass-input resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Thời gian mượn
                      </label>
                      <select
                        value={borrowForm.duration}
                        onChange={(e) => setBorrowForm({ ...borrowForm, duration: e.target.value })}
                        className="glass-input"
                      >
                        <option value="1 giờ">1 giờ</option>
                        <option value="2 giờ">2 giờ</option>
                        <option value="4 giờ">4 giờ</option>
                        <option value="Cả buổi">Cả buổi thực hành</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary-glow py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider mt-2"
                    >
                      Gửi yêu cầu mượn máy
                    </button>
                  </form>
                </div>

              </div>

              {/* BOTTOM TABLE: APPROVAL - Yêu cầu mượn máy */}
              <div className="obsidian-card p-6 lg:p-7 space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
                    APPROVAL
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">
                    Yêu cầu mượn máy
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[11px]">
                        <th className="py-3.5 px-4">Máy</th>
                        <th className="py-3.5 px-4">Người yêu cầu</th>
                        <th className="py-3.5 px-4">Lý do</th>
                        <th className="py-3.5 px-4">Thời gian</th>
                        <th className="py-3.5 px-4">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-white/[0.03] transition">
                          <td className="py-4 px-4 font-bold text-white font-mono text-sm">
                            {req.computerName}
                          </td>
                          <td className="py-4 px-4 text-slate-200">
                            <div className="font-semibold text-white">{req.requester}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{req.requesterId}</div>
                          </td>
                          <td className="py-4 px-4 text-slate-300 max-w-xs truncate font-medium">
                            {req.reason || "Không có lý do"}
                          </td>
                          <td className="py-4 px-4 text-slate-400 font-semibold">
                            {req.duration}
                          </td>
                          <td className="py-4 px-4">
                            {req.status === "approved" && (
                              <span className="badge-available">Đã duyệt</span>
                            )}
                            {req.status === "pending" && (
                              <span className="badge-pending">Chờ duyệt</span>
                            )}
                            {req.status === "rejected" && (
                              <span className="badge-maintenance">Từ chối</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {req.status === "pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, "approved")}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleUpdateRequestStatus(req.id, "rejected")}
                                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold transition"
                                >
                                  Từ chối
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">Hoàn tất</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: HỒ SƠ CÁ NHÂN (Screenshot 4) */}
          {/* ============================================================== */}
          {currentView === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
                    ACCOUNT
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    Hồ sơ cá nhân
                  </h1>
                </div>
                <span className="badge-available px-4 py-1.5 text-xs font-bold">
                  {user.status}
                </span>
              </div>

              {/* Main Profile Card */}
              <div className="obsidian-card p-6 md:p-10">
                <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left Column: Avatar */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
                      Ảnh đại diện
                    </div>
                    
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500/50 shadow-2xl shadow-indigo-500/30">
                      <img
                        src={user.avatar}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="mt-6 w-full">
                      <label className="btn-secondary-glow text-xs w-full justify-center cursor-pointer py-2.5">
                        <span>Đổi ảnh đại diện</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                setUser({ ...user, avatar: uploadEvent.target.result });
                                showToast("Đã tải ảnh mới lên! Bấm Lưu để hoàn tất.");
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2.5">
                      Khuyến nghị ảnh kích thước 400x400px (PNG, JPG)
                    </p>
                  </div>

                  {/* Right Column: Profile Form Fields */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={user.fullName}
                          onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                          className="glass-input"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          MSSV
                        </label>
                        <input
                          type="text"
                          value={user.studentId}
                          onChange={(e) => setUser({ ...user, studentId: e.target.value })}
                          className="glass-input font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Lớp
                        </label>
                        <input
                          type="text"
                          value={user.classRoom}
                          onChange={(e) => setUser({ ...user, classRoom: e.target.value })}
                          className="glass-input font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Giới tính
                        </label>
                        <select
                          value={user.gender}
                          onChange={(e) => setUser({ ...user, gender: e.target.value })}
                          className="glass-input"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={user.phone}
                          onChange={(e) => setUser({ ...user, phone: e.target.value })}
                          className="glass-input font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          className="glass-input"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary-glow px-8 py-3 rounded-xl text-xs font-bold"
                      >
                        Lưu thay đổi hồ sơ
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: SWAGGER API EXPLORER */}
          {/* ============================================================== */}
          {currentView === "swagger" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    OAS 3.0
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">QLPL RESTful Backend API</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1.5">
                  Swagger API Explorer
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Tài liệu và công cụ kiểm thử trực tiếp các API Backend Next.js Serverless & Supabase
                </p>
              </div>

              <div className="space-y-4">
                {/* GET /api/computers */}
                <div className="obsidian-card overflow-hidden border border-cyan-500/40">
                  <div className="p-4 flex items-center justify-between bg-cyan-950/25">
                    <div className="flex items-center gap-3.5">
                      <span className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-extrabold text-xs">
                        GET
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        /api/computers
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline font-medium">
                        Lấy danh sách tất cả các máy tính phòng lab
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/computers");
                          const data = await res.json();
                          alert("Response 200 OK:\n" + JSON.stringify(data, null, 2));
                        } catch (e) {
                          alert("Mock Response 200 OK:\n" + JSON.stringify({ success: true, count: computers.length, data: computers }, null, 2));
                        }
                      }}
                      className="btn-secondary-glow text-xs py-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400" /> Try it out
                    </button>
                  </div>
                </div>

                {/* POST /api/computers */}
                <div className="obsidian-card overflow-hidden border border-emerald-500/40">
                  <div className="p-4 flex items-center justify-between bg-emerald-950/25">
                    <div className="flex items-center gap-3.5">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-extrabold text-xs">
                        POST
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        /api/computers
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline font-medium">
                        Thêm máy tính mới vào phòng
                      </span>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn-secondary-glow text-xs py-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" /> Try it out
                    </button>
                  </div>
                </div>

                {/* GET /api/requests */}
                <div className="obsidian-card overflow-hidden border border-cyan-500/40">
                  <div className="p-4 flex items-center justify-between bg-cyan-950/25">
                    <div className="flex items-center gap-3.5">
                      <span className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-extrabold text-xs">
                        GET
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        /api/requests
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline font-medium">
                        Danh sách các yêu cầu mượn máy
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/requests");
                          const data = await res.json();
                          alert("Response 200 OK:\n" + JSON.stringify(data, null, 2));
                        } catch (e) {
                          alert("Mock Response 200 OK:\n" + JSON.stringify({ success: true, count: requests.length, data: requests }, null, 2));
                        }
                      }}
                      className="btn-secondary-glow text-xs py-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400" /> Try it out
                    </button>
                  </div>
                </div>

                {/* GET /api/stats */}
                <div className="obsidian-card overflow-hidden border border-indigo-500/40">
                  <div className="p-4 flex items-center justify-between bg-indigo-950/25">
                    <div className="flex items-center gap-3.5">
                      <span className="px-3 py-1 rounded-lg bg-indigo-500 text-white font-extrabold text-xs">
                        GET
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        /api/stats
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline font-medium">
                        Thống kê tổng quan và số liệu live
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/stats");
                          const data = await res.json();
                          alert("Response 200 OK:\n" + JSON.stringify(data, null, 2));
                        } catch (e) {
                          alert("Mock Response 200 OK:\n" + JSON.stringify({
                            success: true,
                            data: {
                              total: computers.length,
                              available: availableCount,
                              inUse: inUseCount,
                              maintenance: maintenanceCount
                            }
                          }, null, 2));
                        }
                      }}
                      className="btn-secondary-glow text-xs py-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-400" /> Try it out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: THÊM MÁY TÍNH MỚI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="obsidian-card max-w-lg w-full p-7 border border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-indigo-400" />
                Thêm máy tính mới vào phòng
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddComputerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tên / Mã máy (*)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: M07"
                    value={newCompForm.name}
                    onChange={(e) => setNewCompForm({ ...newCompForm, name: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phòng lab (*)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: C201"
                    value={newCompForm.room}
                    onChange={(e) => setNewCompForm({ ...newCompForm, room: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Vi xử lý (CPU)
                </label>
                <input
                  type="text"
                  placeholder="Intel Core i7-13700"
                  value={newCompForm.cpu}
                  onChange={(e) => setNewCompForm({ ...newCompForm, cpu: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bộ nhớ RAM
                  </label>
                  <input
                    type="text"
                    placeholder="16GB DDR5"
                    value={newCompForm.ram}
                    onChange={(e) => setNewCompForm({ ...newCompForm, ram: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Card đồ họa (GPU)
                  </label>
                  <input
                    type="text"
                    placeholder="RTX 3060 12GB"
                    value={newCompForm.gpu}
                    onChange={(e) => setNewCompForm({ ...newCompForm, gpu: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Trạng thái ban đầu
                </label>
                <select
                  value={newCompForm.status}
                  onChange={(e) => setNewCompForm({ ...newCompForm, status: e.target.value })}
                  className="glass-input"
                >
                  <option value="available">Có sẵn (Available)</option>
                  <option value="in_use">Đang sử dụng (In Use)</option>
                  <option value="maintenance">Bảo trì (Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi chú
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú cấu hình hoặc vị trí..."
                  value={newCompForm.notes}
                  onChange={(e) => setNewCompForm({ ...newCompForm, notes: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary-glow text-xs"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="btn-primary-glow text-xs"
                >
                  Xác nhận thêm máy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT MÁY TÍNH */}
      {selectedComputerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="obsidian-card max-w-md w-full p-7 border border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center font-extrabold text-indigo-400 text-base shadow-md">
                  {selectedComputerDetail.name}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Thông tin máy {selectedComputerDetail.name}
                  </h3>
                  <p className="text-xs text-slate-400">Phòng {selectedComputerDetail.room}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComputerDetail(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 font-medium">Trạng thái:</span>
                <span>
                  {selectedComputerDetail.status === "available" && <span className="badge-available">Có sẵn</span>}
                  {selectedComputerDetail.status === "in_use" && <span className="badge-in-use">Đang dùng</span>}
                  {selectedComputerDetail.status === "maintenance" && <span className="badge-maintenance">Bảo trì</span>}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 font-medium">Người đang dùng:</span>
                <span className="text-white font-bold">{selectedComputerDetail.currentUser || "Không có"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 font-medium">Vi xử lý (CPU):</span>
                <span className="text-white font-bold">{selectedComputerDetail.cpu}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 font-medium">Bộ nhớ (RAM):</span>
                <span className="text-white font-bold">{selectedComputerDetail.ram}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 font-medium">Card màn hình:</span>
                <span className="text-white font-bold">{selectedComputerDetail.gpu}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-400 block mb-1.5 font-medium">Ghi chú thiết bị:</span>
                <p className="text-slate-200 bg-white/[0.03] p-3 rounded-xl border border-white/[0.08] leading-relaxed">
                  {selectedComputerDetail.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComputerDetail(null)}
                className="btn-primary-glow text-xs w-full justify-center py-3"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
