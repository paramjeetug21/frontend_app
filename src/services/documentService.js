import axios from "axios";

const API_BASE = "https://backend-app-chi-ten.vercel.app/documents";

// ✅ Save document & create version
export const createVersion = async (documentId, content) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `${API_BASE}/${documentId}/version`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// ✅ Rollback to a specific version
export const rollbackVersion = async (documentId, versionId) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `${API_BASE}/${documentId}/rollback/${versionId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// ✅ Get all versions
export const getVersions = async (documentId) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE}/${documentId}/versions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
