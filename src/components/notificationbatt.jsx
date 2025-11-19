import React from "react";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ unreadCount }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/notifications")}
      className="relative cursor-pointer"
    >
      notification
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
