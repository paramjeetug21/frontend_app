import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const WorkspaceDocuments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const workspace = location.state?.workspace;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true); // new loading for role
  const [showModal, setShowModal] = useState(false);
  const [newDocument, setNewDocument] = useState({ title: "" });
  const [role, setRole] = useState(null);

  const token = localStorage.getItem("token");

  // ------------------------------
  // FETCH USER ROLE
  // ------------------------------
  const fetchUserRole = async () => {
    if (!workspace) return;

    try {
      const res = await axios.get(
        `https://backend-app-chi-ten.vercel.app/workspace-users/${workspace.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const currentUserId = JSON.parse(localStorage.getItem("user")).id;
      const currentUser = res.data.find((u) => u.userId === currentUserId);

      setRole(currentUser?.role || "Viewer");
    } catch (err) {
      console.error("Failed to fetch role:", err);
      setRole("Viewer");
    } finally {
      setRoleLoading(false);
    }
  };

  // ------------------------------
  // FETCH DOCUMENTS
  // ------------------------------
  const fetchDocuments = async () => {
    if (!workspace) return;

    try {
      const res = await axios.get(
        `https://backend-app-chi-ten.vercel.app/documents?workspaceId=${workspace.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments(res.data);
    } catch (err) {
      console.log("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchUserRole();
  }, [workspace]);

  // ------------------------------
  // CREATE DOCUMENT
  // ------------------------------
  const handleCreateDocument = async () => {
    if (!newDocument.title.trim()) return;

    try {
      const res = await axios.post(
        `https://backend-app-chi-ten.vercel.app/documents/${workspace.id}`,
        newDocument,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDocuments([res.data, ...documents]);
      setShowModal(false);
      setNewDocument({ title: "" });
    } catch (err) {
      alert("Failed to create document");
    }
  };

  // ------------------------------
  // OPEN DOCUMENT
  // ------------------------------
  const handleOpenDocument = (doc) => {
    navigate(`/documents/${doc.id}`, { state: { document: doc, role } });
  };

  // ------------------------------
  // DELETE DOCUMENT
  // ------------------------------
  const handleDeleteDocument = async (docId) => {
    try {
      await axios.delete(
        `https://backend-app-chi-ten.vercel.app/documents/${docId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDocuments(documents.filter((doc) => doc.id !== docId));
      alert("Document deleted successfully");
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document");
    }
  };

  if (!workspace)
    return (
      <h1 className="text-center mt-10 text-2xl">
        ❌ No workspace found. Open from Dashboard only.
      </h1>
    );

  if (loading || roleLoading)
    return <h1 className="text-center mt-10 text-3xl">Loading...</h1>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-200 via-blue-200 to-green-200">
      {/* Navbar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-md shadow-md">
        <h2 className="text-xl font-bold text-gray-800">
          Workspace: {workspace.name} ({role})
          <p>Description: {workspace.description}</p>
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-800 font-semibold hover:text-gray-600 transition"
        >
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h3 className="text-4xl font-extrabold mb-6 text-gray-900">
          Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Create Document */}
          <div
            className="p-6 bg-white/30 backdrop-blur-md border border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center hover:bg-white/40 transition cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <p className="text-4xl font-bold text-green-500">+</p>
            <p className="mt-2 text-gray-800 font-semibold">Create Document</p>
          </div>

          {/* Documents List */}
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="relative p-6 bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="absolute top-3 right-3 text-black text-sm font-thin hover:text-red-400 transition"
              >
                Delete
              </button>

              <div onClick={() => handleOpenDocument(doc)}>
                <h4 className="text-xl font-bold mb-2 text-gray-900">
                  {doc.title}
                </h4>
                <p className="text-gray-700 text-sm">
                  {doc.content?.content?.length
                    ? "Has content"
                    : "Empty document"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Document Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Create New Document
            </h2>

            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Document Title"
                value={newDocument.title}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, title: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-white/30 placeholder-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
              />
              <button
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
                onClick={handleCreateDocument}
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
