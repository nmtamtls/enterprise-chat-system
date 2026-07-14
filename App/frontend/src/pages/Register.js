


import React, { useState } from "react";
import styles from "../styles/Register.module.css";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getEmailSuggestion = (email) => {
    if (!email.includes("@")) return "";

    const [name, domain] = email.split("@");
    if (!domain) return "";

    const domains = {
      gmail: "gmail.com",
      yahoo: "yahoo.com",
      outlook: "outlook.com",
      hotmail: "hotmail.com"
    };

    for (const key in domains) {
      if (domain === key || domain.startsWith(key)) {
        return `${name}@${domains[key]}`;
      }
    }

    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();

    setForm({ ...form, email: value });

    if (!value) {
      setEmailError("");
      setEmailSuggestion("");
      return;
    }

    if (!validateEmail(value)) {
      setEmailError("Email không đúng định dạng.");
      setEmailSuggestion(getEmailSuggestion(value));
    } else {
      setEmailError("");
      setEmailSuggestion("");
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8082/api/auth/register", {
      //  const res = await fetch("https://tqgwvv8g-8082.asse.devtunnels.ms/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Tạo tài khoản thành công!");
        window.location.href = "/login";
      } else {
        setError(data.message || "Đã xảy ra lỗi khi đăng ký.");
      }
    } catch (err) {
      setError("Không thể kết nối đến server.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Tạo tài khoản</h2>

        <form onSubmit={handleRegister}>
          {/* EMAIL */}
          <div className={styles.inputGroup}>
            <label
              className={styles.label}
              style={{ color: emailError ? "#ed4245" : undefined }}
            >
              Email {emailError && <span>(Lỗi)</span>}
            </label>

            <input
              type="text"
              className={styles.input}
              value={form.email}
              onChange={handleEmailChange}
              required
              style={{
                border: emailError ? "1px solid #ed4245" : undefined,
                boxShadow: emailError
                  ? "0 0 0 1px #ed4245"
                  : undefined
              }}
            />

            {emailError && (
              <p
                style={{
                  color: "#ed4245",
                  fontSize: "12px",
                  marginTop: "6px"
                }}
              >
                {emailError}
              </p>
            )}

            {emailSuggestion && (
              <p
                style={{
                  color: "#5865f2",
                  fontSize: "12px",
                  marginTop: "4px",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setForm({ ...form, email: emailSuggestion });
                  setEmailError("");
                  setEmailSuggestion("");
                }}
              >
                Bạn có muốn nhập: <strong>{emailSuggestion}</strong> ?
              </p>
            )}
          </div>

          {/* USERNAME */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              className={styles.input}
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
            />
          </div>

          {/* FULL NAME */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Họ và tên</label>
            <input
              type="text"
              className={styles.input}
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" className={styles.button}>
            Tiếp tục
          </button>
        </form>

        <p className={styles.footerText}>
          <a href="/login" className={styles.link}>
            Bạn đã có tài khoản?
          </a>
        </p>
      </div>
    </div>
  );
} 