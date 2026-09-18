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

// Empty State Template (Populated directly from Supabase database)
const EMPTY_USER = {
  fullName: "Đang tải hồ sơ...",
  studentId: "",
  classRoom: "",
  gender: "Nam",
  phone: "",
  email: "",
  role: "Quản trị viên",
  status: "ACTIVE",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
};

export default function Home() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState("dashboard"); // login, dashboard, computers, swagger, profile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // App Live Data State (Synced with Supabase)
  const [user, setUser] = useState(EMPTY_USER);
  const [profileForm, setProfileForm] = useState(EMPTY_USER);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [computers, setComputers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [stats, setStats] = useState({
    userCount: 0,
    totalComputers: 0,
    inUseComputers: 0,
    availableComputers: 0,
    maintenanceComputers: 0,
    totalUsageHours: "0.0h"
  });
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch Profile once on mount or upon save
  const fetchProfile = async () => {
    try {
      const resProfile = await fetch("/api/profile");
      if (resProfile.ok) {
        const dataProfile = await resProfile.json();
        if (dataProfile.data) {
          setUser(dataProfile.data);
          setProfileForm(dataProfile.data);
        }
      }
    } catch (e) {
      console.warn("Lỗi tải hồ sơ Supabase:", e);
    }
  };

  // Sync shared resources with Supabase via API Routes (interval polling)
  const fetchBackendData = async () => {
    try {
      const [resComps, resReqs, resStats, resUsage] = await Promise.all([
        fetch("/api/computers"),
        fetch("/api/requests"),
        fetch("/api/stats"),
        fetch("/api/usage-logs")
      ]);

      if (resComps.ok) {
        const dataComps = await resComps.json();
        if (dataComps.data) setComputers(dataComps.data);
      }
      if (resReqs.ok) {
        const dataReqs = await resReqs.json();
        if (dataReqs.data) setRequests(dataReqs.data);
      }
      if (resStats.ok) {
        const dataStats = await resStats.json();
        if (dataStats.data) setStats(dataStats.data);
      }
      if (resUsage.ok) {
        const dataUsage = await resUsage.json();
        if (dataUsage.data) setUsageLogs(dataUsage.data);
      }
    } catch (e) {
      console.warn("Lỗi tải dữ liệu Supabase:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Computed metrics from real data
  const availableCount = computers.filter(c => c.status === "available").length;
  const inUseCount = computers.filter(c => c.status === "in_use").length;
  const maintenanceCount = computers.filter(c => c.status === "maintenance").length;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;

  // Filtered computers list
  const filteredComputers = computers.filter(c => {
    const matchesSearch = (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.room || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cpu && c.cpu.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRoom = selectedRoomFilter === "all" || (c.room || "").toLowerCase() === selectedRoomFilter.toLowerCase();
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
    } catch (err) { }
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

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          computerId: comp.id,
          reason: borrowForm.reason || "Làm bài thực hành",
          duration: borrowForm.duration,
          requesterName: user.fullName || "Sinh viên"
        })
      });
      if (res.ok) {
        showToast("Gửi yêu cầu mượn máy thành công! Đang chờ duyệt.");
        setBorrowForm({ computerId: "", reason: "", duration: "2 giờ" });
        await fetchBackendData();
        return;
      }
    } catch (e) { }

    showToast("Gửi yêu cầu mượn máy thành công! Đang chờ duyệt.");
    setBorrowForm({ computerId: "", reason: "", duration: "2 giờ" });
    fetchBackendData();
  };

  // Handle Request Approval / Rejection
  const handleUpdateRequestStatus = async (reqId, newStatus) => {
    try {
      await fetch(`/api/requests/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Đã cập nhật trạng thái yêu cầu sang "${newStatus}"`);
    } catch (e) {
      showToast("Lỗi khi cập nhật trạng thái", "error");
    } finally {
      await fetchBackendData();
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
        setIsAddModalOpen(false);
        showToast(`Đã thêm máy ${newComp.name} vào hệ thống!`);
        await fetchBackendData();
        return;
      }
    } catch (e) { }

    setIsAddModalOpen(false);
    showToast(`Đã thêm máy ${newComp.name} vào hệ thống!`);
    await fetchBackendData();
  };

  // Handle Delete Computer
  const handleDeleteComputer = async (compId) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá máy ${compId} khỏi danh sách?`)) return;

    try {
      await fetch(`/api/computers/${compId}`, { method: "DELETE" });
      showToast(`Đã xoá máy ${compId} thành công!`, "info");
    } catch (e) { }
    await fetchBackendData();
  };

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        setUser(profileForm);
        setIsProfileEditing(false);
        showToast("Đã lưu thay đổi hồ sơ cá nhân vào Supabase thành công!");
        await fetchProfile();
      } else {
        showToast("Lỗi khi cập nhật hồ sơ", "error");
      }
    } catch (e) {
      showToast("Lỗi khi cập nhật hồ sơ", "error");
    } finally {
      await fetchBackendData();
    }
  };

  // -------------------------------------------------------------
  // VIEW: LOGIN SCREEN (Screenshot 1)
  // -------------------------------------------------------------
  if (currentView === "login" || !isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#070a12] relative overflow-hidden">
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
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#0e1424]/95 backdrop-blur-xl">
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
  // MAIN APPLICATION LAYOUT (Obsidian Black Edition matching reference proportions)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col p-3 sm:p-4 lg:p-5 gap-4">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border border-indigo-500/40 bg-[#12192c]/95 text-white shadow-xl animate-bounce-short">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* 1. TOP NAVBAR (Matching Screenshot: Sleek compact floating card) */}
      <header className="w-full obsidian-card px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-lg">
        
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentView("dashboard")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-md shadow-indigo-500/25 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0d1324] rounded-[10px] flex items-center justify-center font-extrabold text-sm text-white">
                Q
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-slate-400 font-extrabold leading-none">
                WORKSPACE
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight mt-0.5">
                QLPL Demo
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status badge & User Profile pill */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="hidden xs:inline">System online</span>
          </div>

          {/* User Profile pill */}
          <div
            onClick={() => setCurrentView("profile")}
            className="flex items-center gap-2.5 p-1 pr-3.5 rounded-full bg-white/[0.06] border border-white/[0.12] hover:border-indigo-500/50 hover:bg-white/[0.1] transition cursor-pointer shadow-2xs"
          >
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover border border-indigo-500/50"
            />
            <span className="hidden md:inline text-xs font-bold text-slate-200">
              {user.fullName}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setCurrentView("login");
              showToast("Đã đăng xuất tài khoản", "info");
            }}
            title="Đăng xuất"
            className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-slate-400 hover:text-rose-400 transition shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT: SIDEBAR + MAIN CANVAS */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-4 items-stretch">
        
        {/* LEFT SIDEBAR (Matching Screenshot: Exact Width, Nav and Yellow Role Pill) */}
        <aside
          className={`fixed md:sticky top-4 z-30 w-full md:w-56 lg:w-64 obsidian-card p-4 sm:p-5 flex flex-col justify-between shrink-0 transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-[110%] md:translate-x-0"
          }`}
          style={{ minHeight: "calc(100vh - 6.5rem)" }}
        >
          <div className="space-y-3">
            <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-2">
              NAVIGATION
            </div>
            
            <nav className="space-y-1.5">
              <button
                onClick={() => { setCurrentView("dashboard"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentView === "dashboard"
                    ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-bold shadow-sm shadow-indigo-500/15"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Trang chủ</span>
              </button>

              <button
                onClick={() => { setCurrentView("computers"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentView === "computers"
                    ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-bold shadow-sm shadow-indigo-500/15"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Monitor className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Quản lý máy tính</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold">
                  {computers.length}
                </span>
              </button>

              <button
                onClick={() => { setCurrentView("swagger"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentView === "swagger"
                    ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-bold shadow-sm shadow-indigo-500/15"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Swagger API</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  REST
                </span>
              </button>

              <button
                onClick={() => { setCurrentView("profile"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentView === "profile"
                    ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-bold shadow-sm shadow-indigo-500/15"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hồ sơ</span>
              </button>
            </nav>
          </div>

          {/* Bottom Role Pill (Matching Screenshot: Pill badge with amber border) */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="w-full py-2 px-3 rounded-full border border-amber-400/40 bg-amber-400/10 text-center text-xs font-bold text-amber-300 shadow-sm truncate">
              Vai trò: {user.role || "Quản trị viên"}
            </div>
            <button
              onClick={() => setCurrentView("login")}
              className="w-full text-center py-1 text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition"
            >
              Xem trang Đăng nhập (Auth)
            </button>
          </div>
        </aside>

        {/* MAIN DISPLAY CANVAS */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-4">
          
          {/* ============================================================== */}
          {/* VIEW: DASHBOARD (Matching Reference Screenshot in Black Edition) */}
          {/* ============================================================== */}
          {currentView === "dashboard" && (
            <div className="space-y-4">
              
              {/* Header Title Section */}
              <div className="px-1 pt-0.5">
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Tổng quan hệ thống phòng máy và người dùng
                </p>
              </div>

              {/* 4 TOP KPI CARDS (Generous inner padding: text deeply indented, never touches border) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* 1. Người dùng */}
                <div className="obsidian-card-hover p-6 rounded-2xl flex items-center justify-between min-h-[135px] overflow-hidden shadow-lg">
                  <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">Người dùng</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white my-1.5 leading-none tracking-tight">
                      {stats.userCount || (user && user.fullName && user.fullName !== "Đang tải hồ sơ..." ? 1 : 0)}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate" title="Tổng số tài khoản đăng ký">
                      Tổng số tài khoản đăng ký
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* 2. Máy tính */}
                <div className="obsidian-card-hover p-6 rounded-2xl flex items-center justify-between min-h-[135px] overflow-hidden shadow-lg">
                  <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">Máy tính</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white my-1.5 leading-none tracking-tight">
                      {computers.length}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate" title="Tổng số máy hiện có">
                      Tổng số máy hiện có
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Monitor className="w-5 h-5" />
                  </div>
                </div>

                {/* 3. Máy đang dùng */}
                <div className="obsidian-card-hover p-6 rounded-2xl flex items-center justify-between min-h-[135px] overflow-hidden shadow-lg">
                  <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">Máy đang dùng</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white my-1.5 leading-none tracking-tight">
                      {inUseCount}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate" title="Máy đang được sử dụng">
                      Máy đang được sử dụng
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Laptop className="w-5 h-5" />
                  </div>
                </div>

                {/* 4. Tổng thời gian */}
                <div className="obsidian-card-hover p-6 rounded-2xl flex items-center justify-between min-h-[135px] overflow-hidden shadow-lg">
                  <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">Tổng thời gian</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white my-1.5 leading-none tracking-tight">
                      {stats.totalUsageHours || "0.0h"}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate" title="Tổng thời gian đã sử dụng">
                      Tổng thời gian đã sử dụng
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* 2 MAIN LOWER PANELS: MÁY THEO TRẠNG THÁI & BIỂU ĐỒ THỜI GIAN THỰC */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
                
                {/* Left Panel: Máy theo trạng thái (5 cols) */}
                <div className="xl:col-span-5 obsidian-card p-6 sm:p-7 flex flex-col justify-between min-h-[360px]">
                  <div>
                    <div className="flex items-center justify-between mb-4 px-0.5">
                      <div>
                        <h2 className="text-base font-extrabold text-white tracking-tight">
                          Máy theo trạng thái
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Phân bổ thiết bị trong phòng lab</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                        {computers.length} TOTAL
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Có sẵn */}
                      <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden flex items-center justify-between">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none transition-all duration-500"
                          style={{ width: `${computers.length ? (availableCount / computers.length) * 100 : 0}%` }}
                        />
                        <div className="relative z-10 flex items-center gap-3 pl-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                          <span className="text-xs font-bold text-white">Có sẵn</span>
                        </div>
                        <div className="relative z-10 font-mono text-xs font-extrabold text-emerald-400 pr-1">
                          {availableCount} máy ({computers.length ? Math.round((availableCount / computers.length) * 100) : 0}%)
                        </div>
                      </div>

                      {/* Đang sử dụng */}
                      <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden flex items-center justify-between">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-amber-500/10 pointer-events-none transition-all duration-500"
                          style={{ width: `${computers.length ? (inUseCount / computers.length) * 100 : 0}%` }}
                        />
                        <div className="relative z-10 flex items-center gap-3 pl-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
                          <span className="text-xs font-bold text-white">Đang sử dụng</span>
                        </div>
                        <div className="relative z-10 font-mono text-xs font-extrabold text-amber-400 pr-1">
                          {inUseCount} máy ({computers.length ? Math.round((inUseCount / computers.length) * 100) : 0}%)
                        </div>
                      </div>

                      {/* Bảo trì */}
                      <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden flex items-center justify-between">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none transition-all duration-500"
                          style={{ width: `${computers.length ? (maintenanceCount / computers.length) * 100 : 0}%` }}
                        />
                        <div className="relative z-10 flex items-center gap-3 pl-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-xs shadow-rose-400" />
                          <span className="text-xs font-bold text-white">Bảo trì</span>
                        </div>
                        <div className="relative z-10 font-mono text-xs font-extrabold text-rose-400 pr-1">
                          {maintenanceCount} máy ({computers.length ? Math.round((maintenanceCount / computers.length) * 100) : 0}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Breakdown Footer (Calculated dynamically) */}
                  <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-2 gap-2.5 px-0.5">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center truncate">
                      <div className="text-[10px] text-slate-400">Phòng C201</div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">
                        {computers.filter(c => c.room === 'C201').length} máy ({computers.filter(c => c.room === 'C201' && c.status === 'available').length} Có sẵn)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center truncate">
                      <div className="text-[10px] text-slate-400">Phòng C202</div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">
                        {computers.filter(c => c.room === 'C202').length} máy ({computers.filter(c => c.room === 'C202' && c.status === 'in_use').length} Đang dùng)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Thời gian sử dụng theo máy (7 cols) */}
                <div className="xl:col-span-7 obsidian-card p-6 sm:p-7 flex flex-col justify-between min-h-[360px]">
                  <div>
                    <div className="flex items-center justify-between mb-3 px-0.5">
                      <div>
                        <h2 className="text-base font-extrabold text-white tracking-tight">
                          Thời gian sử dụng theo máy
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Biểu đồ giám sát tải phòng máy thời gian thực từ Supabase</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-xs text-slate-400">
                          Máy theo dõi: <strong className="text-indigo-400 font-bold">{usageLogs.length} phiên</strong>
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          LIVE
                        </span>
                      </div>
                    </div>

                    {/* Bar Chart Container (Dynamic from Supabase usage_logs) */}
                    {(!usageLogs || usageLogs.length === 0) ? (
                      <div className="relative h-[210px] w-full flex flex-col items-center justify-center text-center p-4 bg-[#080d1a] rounded-xl border border-white/10 mt-3">
                        <Clock className="w-7 h-7 text-indigo-400/60 mb-2 animate-pulse" />
                        <span className="text-xs text-slate-300 font-semibold">Đang nạp dữ liệu từ bảng usage_logs trong Supabase...</span>
                        <span className="text-[11px] text-slate-500 mt-1">Dữ liệu tải thời gian thực sẽ tự động hiển thị tại đây</span>
                      </div>
                    ) : (
                      <div className="relative h-[210px] w-full flex items-end justify-between gap-2 pt-8 pb-3 px-4 bg-[#080d1a] rounded-xl border border-white/10 mt-3 shadow-inner">
                        <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
                          <div className="border-b border-dashed border-slate-500 w-full" />
                          <div className="border-b border-dashed border-slate-500 w-full" />
                          <div className="border-b border-dashed border-slate-500 w-full" />
                        </div>

                        {usageLogs.map((item, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative z-10">
                            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-indigo-950 border border-indigo-500/60 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-20">
                              {item.label || item.computerId}: {item.val}%
                            </div>
                            <div className="w-full max-w-[34px] h-[130px] bg-slate-800/80 rounded-lg flex items-end overflow-hidden">
                              <div
                                className="w-full rounded-lg bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 group-hover:brightness-125 transition-all duration-300 shadow-md shadow-indigo-500/30"
                                style={{ height: `${Math.min(100, Math.max(8, item.val))}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-400 group-hover:text-indigo-300 font-mono font-bold">
                              {item.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10 px-0.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      Cập nhật tự động mỗi 6 giây từ CSDL
                    </span>
                    <button
                      onClick={() => {
                        fetchBackendData();
                        showToast("Đã đồng bộ lại dữ liệu từ Supabase!");
                      }}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Làm mới
                    </button>
                  </div>
                </div>

              </div>

              {/* 3. RECENT ACTIVITY ON DASHBOARD */}
              <div className="obsidian-card p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 px-0.5">
                  <div>
                    <h2 className="text-base font-bold text-white">Yêu cầu mượn máy gần đây</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dữ liệu thời gian thực từ bảng borrow_requests</p>
                  </div>
                  <button
                    onClick={() => setCurrentView("computers")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    Xem tất cả trong Quản lý máy tính <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Mã máy</th>
                        <th className="py-3 px-4">Người yêu cầu</th>
                        <th className="py-3 px-4">Lý do mượn</th>
                        <th className="py-3 px-4">Thời lượng</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Chưa có yêu cầu mượn máy nào trong CSDL Supabase
                          </td>
                        </tr>
                      ) : (
                        requests.slice(0, 5).map((req) => (
                          <tr key={req.id} className="hover:bg-white/[0.03] transition">
                            <td className="py-3.5 px-4 font-bold text-white font-mono text-xs whitespace-nowrap">
                              {req.computerName}
                            </td>
                            <td className="py-3.5 px-4 text-slate-200 whitespace-nowrap">
                              <span className="font-semibold text-white">{req.requester}</span>
                              {req.requesterId && (
                                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({req.requesterId})</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate font-medium">
                              {req.reason || "Không có lý do"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-semibold whitespace-nowrap">
                              {req.duration}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
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
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {req.status === "pending" ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req.id, "approved")}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition shadow-xs"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req.id, "rejected")}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold transition shadow-xs"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 font-medium">Hoàn tất</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                  <div className="obsidian-card-hover p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[145px] border-l-4 border-l-emerald-500 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">MÁY CÓ SẴN</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white my-1 tracking-tight">{availableCount}</div>
                    <div className="text-[11px] text-slate-400">Sẵn sàng phục vụ sinh viên</div>
                  </div>

                  <div className="obsidian-card-hover p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[145px] border-l-4 border-l-amber-500 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">ĐANG SỬ DỤNG</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                        <Laptop className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white my-1 tracking-tight">{inUseCount}</div>
                    <div className="text-[11px] text-slate-400">Đang có phiên thực hành</div>
                  </div>

                  <div className="obsidian-card-hover p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[145px] border-l-4 border-l-rose-500 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-rose-400 tracking-wider">BẢO TRÌ</span>
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white my-1 tracking-tight">{maintenanceCount}</div>
                    <div className="text-[11px] text-slate-400">Tạm dừng để kiểm tra, sửa</div>
                  </div>

                  <div className="obsidian-card-hover p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[145px] border-l-4 border-l-cyan-500 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider">YÊU CẦU CHỜ</span>
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl lg:text-4xl font-extrabold text-white my-1 tracking-tight">{pendingRequestsCount}</div>
                    <div className="text-[11px] text-slate-400">Cần quản trị viên duyệt</div>
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
                      {filteredComputers.length === 0 && (
                        <div className="text-center py-10 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                          <Monitor className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-60" />
                          <p className="text-slate-300 font-semibold text-sm">Chưa có máy tính nào trong Supabase</p>
                          <p className="text-slate-500 text-xs mt-1">Vui lòng thêm máy tính mới hoặc import dữ liệu mẫu vào Supabase</p>
                        </div>
                      )}
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
                              onClick={async () => {
                                const newNotes = prompt(`Sửa ghi chú cho máy ${comp.name}:`, comp.notes || "");
                                if (newNotes !== null) {
                                  try {
                                    await fetch(`/api/computers/${comp.id}`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ notes: newNotes })
                                    });
                                  } catch (err) {}
                                  await fetchBackendData();
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
                          src={profileForm.avatar || user.avatar}
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
                                  setIsProfileEditing(true);
                                  setProfileForm(prev => ({ ...prev, avatar: uploadEvent.target.result }));
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
                            value={profileForm.fullName ?? ""}
                            onChange={(e) => {
                              setIsProfileEditing(true);
                              setProfileForm(prev => ({ ...prev, fullName: e.target.value }));
                            }}
                            className="glass-input"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            MSSV
                          </label>
                          <input
                            type="text"
                            value={profileForm.studentId ?? ""}
                            onChange={(e) => {
                              setIsProfileEditing(true);
                              setProfileForm(prev => ({ ...prev, studentId: e.target.value }));
                            }}
                            className="glass-input font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Lớp
                          </label>
                          <input
                            type="text"
                            value={profileForm.classRoom ?? ""}
                            onChange={(e) => {
                              setIsProfileEditing(true);
                              setProfileForm(prev => ({ ...prev, classRoom: e.target.value }));
                            }}
                            className="glass-input font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Giới tính
                          </label>
                          <select
                            value={profileForm.gender ?? "Nam"}
                            onChange={(e) => {
                              setIsProfileEditing(true);
                              setProfileForm(prev => ({ ...prev, gender: e.target.value }));
                            }}
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
                            value={profileForm.phone ?? ""}
                            onChange={(e) => {
                              setIsProfileEditing(true);
                              setProfileForm(prev => ({ ...prev, phone: e.target.value }));
                            }}
                            className="glass-input font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Email
                          </label>
                          <input
                            type="email"
                            value={profileForm.email ?? ""}
                            onChange={(e) => {
                              setIsProfileEditing(true);
                              setProfileForm(prev => ({ ...prev, email: e.target.value }));
                            }}
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
