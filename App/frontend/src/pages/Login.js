import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import styles from "../styles/Login.module.css"; // 🔥 Import CSS Module

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    try {
      const data = await loginApi({ username, password });

      if (!data.success) {
        throw new Error(data.message);
      }

      const user = {
        id: data.data.id,
        username: data.data.username,
        role: data.data.role
      };

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }

    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Đăng nhập</h2>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span 
              className={styles.forgotLink}
              onClick={() => alert("Tính năng đang phát triển!")}
            >
              Quên mật khẩu?
            </span>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" className={styles.button}>
            Đăng nhập
          </button>
        </form>

        <p className={styles.footerText}>
          Chưa có tài khoản?{" "}
          <span 
            className={styles.link} 
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
}