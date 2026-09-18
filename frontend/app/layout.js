import "./globals.css";

export const metadata = {
  title: "QLPL Demo - Hệ Thống Quản Lý Phòng Máy (Black Luxury Edition)",
  description: "Hệ thống quản trị và đăng ký mượn máy tính phòng thực hành - Giao diện Black / Dark Mode hiện đại",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[#080b11] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
