import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-app-chi-ten.vercel.app/workspace-users";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch notifications when page loads
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/notification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.log("Error fetching notifications", error);
    }
  };

  const openNotification = async (item) => {
    setSelected(item);

    // Mark notification as read (PATCH)
    if (!item.isRead) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `${API_BASE}/notification/${item.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update UI instantly
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.log("Error marking as read", error);
      }
    }
  };

  const closePopup = () => {
    setSelected(null);
  };

  return (
    <div className="min-h-screen px-8 py-10 bg-gradient-to-br from-yellow-200 via-blue-200 to-green-200">
      <h2 className="text-4xl font-extrabold mb-10 text-gray-900">
        Notifications
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => openNotification(item)}
            className={`
              rounded-2xl p-6 cursor-pointer transition-all backdrop-blur-lg
              border shadow-xl hover:scale-105 hover:shadow-2xl 
              ${
                item.isRead
                  ? "bg-white/30 text-gray-900 border-white/40"
                  : "bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 text-white font-semibold shadow-2xl scale-[1.02]"
              }
            `}
          >
            <p className="text-lg">{item.message}</p>

            {!item.isRead && (
              <span className="inline-block mt-4 px-3 py-1 text-xs rounded-xl bg-white/30 backdrop-blur-md">
                New
              </span>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-lg"
            onClick={closePopup}
          ></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Notification
            </h3>

            <p className="text-gray-800 text-lg mb-6">{selected.message}</p>

            <button
              onClick={closePopup}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
