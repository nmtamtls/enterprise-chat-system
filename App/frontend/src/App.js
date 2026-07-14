// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Home from "./pages/Home";
// import PrivateRoute from "./routes/PrivateRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         <Route path="/" element={<Navigate to="/login" />} />

//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         <Route
//           path="/home"
//           element={
//             <PrivateRoute>
//               <Home />
//             </PrivateRoute>
//           }
//         />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;







// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Home from "./pages/Home";

// // 🔥 ADMIN
// import AdminDashboard from "./pages/admin/AdminDashboard";

// // 🔥 ROUTES
// import PrivateRoute from "./routes/PrivateRoute";
// import AdminRoute from "./routes/AdminRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* redirect root */}
//         <Route path="/" element={<Navigate to="/login" />} />

//         {/* auth */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* USER */}
//         <Route
//           path="/home"
//           element={
//             <PrivateRoute>
//               <Home />
//             </PrivateRoute>
//           }
//         />

//         {/* 🔥 ADMIN */}
//         <Route
//           path="/admin"
//           element={
//             <AdminRoute>
//               <AdminDashboard />
//             </AdminRoute>
//           }
//         />

//         {/* fallback */}
//         <Route path="*" element={<Navigate to="/login" />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;






import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      // Kiểm tra biến global được gán từ useChat
      if (window.globalStompClient && window.globalStompClient.connected) {
        window.globalStompClient.publish({
          destination: "/app/user.offline",
          body: JSON.stringify({ userId: currentUser?.id }),
        });
        // Ngắt kết nối thực sự khi đóng tab/trình duyệt
        window.globalStompClient.deactivate();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;