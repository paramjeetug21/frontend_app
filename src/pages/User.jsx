import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationPage from "./notification";
import NotificationBell from "../components/notificationbatt";

export const User = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
    color: "bg-white/20",
  });

  // Add Member state
  const [showAddMemberModal, setShowAddMemberModal] = useState(null); // store workspace id
  const [newMember, setNewMember] = useState({ email: "", role: "" });

  const presetColors = [
    "bg-red-100/50",
    "bg-orange-100/50",
    "bg-pink-100/50",
    "bg-purple-100/50",
    "bg-yellow-100/50",
    "bg-green-100/50",
    "bg-blue-100/50",
    "bg-indigo-100/50",
    "bg-teal-100/50",
  ];

  const location = useLocation();

  // ----------------------------------------------------------
  // 🔥 GOOGLE LOGIN REDIRECT FIX (NO /auth/me REQUIRED)
  // ----------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(Location.search);
    const googleToken = params.get("token");

    if (!googleToken) return;

    // 1. Save token
    localStorage.setItem("token", googleToken);

    // 2. Save dummy user (Google provider)
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Google User",
        email: "google-user",
        auth_provider: "google",
      })
    );

    // 3. Remove ?token= from URL
    window.history.replaceState({}, "", "/user");
    navigate("/user", { replace: true });
  }, [location.search, navigate]);

  // Load user + workspaces
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(savedUser));

    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get(
          "https://backend-app-chi-ten.vercel.app/workspaces",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkspaces(res.data);
      } catch (err) {
        console.log("Error fetching workspaces:", err);
      }

      setLoading(false);
    };

    fetchWorkspaces();
  }, [navigate]);

  // Create workspace
  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name) return;

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "https://backend-app-chi-ten.vercel.app/workspaces",
        newWorkspace,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setWorkspaces([res.data, ...workspaces]);
      setShowModal(false);
      setNewWorkspace({ name: "", description: "", color: "bg-white/20" });
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Server error");
    }
  };

  // Delete workspace
  const handleDeleteWorkspace = async (workspaceId, e) => {
    e.stopPropagation(); // ⛔ Prevent opening workspace

    const confirmDelete = window.confirm("Delete this workspace?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `https://backend-app-chi-ten.vercel.app/workspaces/${workspaceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setWorkspaces(workspaces.filter((w) => w.id !== workspaceId));
    } catch (err) {
      console.log(err);
      alert("Failed to delete workspace");
    }
  };

  // Add Member
  const handleAddMember = async () => {
    if (!newMember.email || !newMember.role) {
      alert("Both Email and Role are required!");
      return;
    }

    const token = localStorage.getItem("token");
    console.log(newMember);
    try {
      const res = await axios.post(
        `https://backend-app-chi-ten.vercel.app/workspace-users/add-by-email/${showAddMemberModal}`, // workspaceId
        {
          email: newMember.email,
          role: newMember.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(
        `Member ${newMember.email} as ${newMember.role} added successfully!`
      );
      setShowAddMemberModal(null);
      setNewMember({ email: "", role: "" });
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to add member. Make sure email exists and is not already in workspace."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("workspaceId");
    navigate("/login");
  };

  if (loading)
    return <h1 className="text-center mt-10 text-3xl">Loading...</h1>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-200 via-blue-200 to-green-200">
      {/* Navbar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-md shadow-md">
        <div className="text-gray-800 font-semibold text-lg">
          Hello, <span className="font-bold">{user?.name}</span>
        </div>

        <nav className="flex items-center space-x-6 text-gray-800 font-semibold">
          <span className="cursor-pointer hover:text-gray-600 transition">
            <NotificationBell />
          </span>

          <button
            onClick={handleLogout}
            className="cursor-pointer hover:text-gray-600 transition font-semibold"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <h3 className="text-4xl font-extrabold mb-6 flex">
          {"Workspaces".split("").map((char, i) => (
            <span
              key={i}
              className={`bg-clip-text text-transparent bg-gradient-to-r ${
                [
                  "from-red-500 via-pink-500 to-yellow-500",
                  "from-indigo-500 via-purple-500 to-pink-500",
                  "from-green-400 via-blue-400 to-indigo-400",
                  "from-yellow-400 via-orange-400 to-red-400",
                  "from-purple-500 via-pink-500 to-red-500",
                  "from-blue-500 via-indigo-500 to-purple-500",
                  "from-pink-400 via-red-400 to-yellow-400",
                  "from-teal-400 via-green-400 to-blue-400",
                  "from-orange-400 via-yellow-400 to-pink-400",
                  "from-indigo-500 via-purple-500 to-pink-500",
                ][i % 10]
              }`}
            >
              {char}
            </span>
          ))}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Create Workspace Box */}
          <div
            className="p-6 bg-white/30 backdrop-blur-md border border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center hover:bg-white/40 transition cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <p className="text-4xl font-bold text-green-500">+</p>
            <p className="mt-2 text-gray-800 font-semibold">Create Workspace</p>
          </div>

          {/* Workspaces */}
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className={`relative p-6 ${ws.color} backdrop-blur-md border border-white/20 rounded-2xl shadow hover:shadow-lg transition cursor-pointer`}
              onClick={() =>
                navigate("/workspace-documents", { state: { workspace: ws } })
              }
            >
              {/* Add Member Button */}
              <button
                className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs hover:bg-green-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMemberModal(ws.id);
                }}
              >
                Add Member
              </button>

              {/* Delete Button */}
              <button
                className="absolute top-10 right-3 px-2 py-1 rounded-lg text-xs hover:bg-red-400"
                onClick={(e) => handleDeleteWorkspace(ws.id, e)}
              >
                Delete
              </button>

              <h4 className="text-xl font-bold mb-2 text-gray-900">
                {ws.name}
              </h4>
              <p className="text-gray-700 text-sm">
                {ws.description || "No description"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Create New Workspace
            </h2>

            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Workspace Name"
                value={newWorkspace.name}
                onChange={(e) =>
                  setNewWorkspace({ ...newWorkspace, name: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-white/30"
              />

              <textarea
                placeholder="Description (optional)"
                value={newWorkspace.description}
                onChange={(e) =>
                  setNewWorkspace({
                    ...newWorkspace,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-white/30"
                rows={4}
              ></textarea>

              {/* Color Picker */}
              <div className="flex flex-wrap gap-3">
                {presetColors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`${color} w-8 h-8 rounded-full cursor-pointer border border-gray-300`}
                    onClick={() =>
                      setNewWorkspace({ ...newWorkspace, color: color })
                    }
                  ></div>
                ))}
              </div>

              <button
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
                onClick={handleCreateWorkspace}
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAddMemberModal(null)}
          ></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Add Member
            </h2>

            <div className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-white/30 placeholder-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition"
              />

              <select
                value={newMember.role}
                onChange={(e) =>
                  setNewMember({ ...newMember, role: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-white/50 border border-white/30 focus:ring-2 focus:ring-green-400 outline-none transition"
              >
                <option value="">Select Role</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
                onClick={handleAddMember}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
