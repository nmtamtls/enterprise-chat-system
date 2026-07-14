

const BASE_URL = "http://localhost:8082/api/users";
// const BASE_URL = "https://tqgwvv8g-8082.asse.devtunnels.ms/api/users";
// =====================================================
// GET USER
// =====================================================

export const getUserApi = async (username) => {

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/${username}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Get user failed");
  }

  return await res.json();
};

// =====================================================
// GET CURRENT USER
// =====================================================

export const getCurrentUserApi = async () => {

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Get current user failed");
  }

  return await res.json();
};

// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfileApi = async (data) => {

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/me`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Update profile failed");
  }

  return await res.json();
};

// =====================================================
// UPLOAD AVATAR
// =====================================================

export const uploadAvatarApi = async (file) => {

  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("file", file);

  const res = await fetch(
    `${BASE_URL}/avatar`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Upload avatar failed");
  }

  return await res.json();
};

