const BASE_URL =
  "http://localhost:8082/api/files";

// const BASE_URL =
//   "https://tqgwvv8g-8082.asse.devtunnels.ms/api/files";
const getHeaders = () => ({
  Authorization:
    `Bearer ${localStorage.getItem("token")}`,
});

// ======================================
// UPLOAD FILE
// ======================================

export const uploadFileApi = async (
  file
) => {

  const formData = new FormData();

  formData.append("file", file);

  const res = await fetch(
    `${BASE_URL}/upload`,
    {
      method: "POST",
      headers: getHeaders(),
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(
      "Upload file thất bại"
    );
  }

  return res.json();
};