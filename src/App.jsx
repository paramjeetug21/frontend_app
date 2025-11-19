import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { User } from "./pages/User";
import { Analytics } from "./pages/Analytics";
import { Document } from "./pages/Document";
import { WorkspaceDocuments } from "./pages/WorkspaceDocument";
import NotificationPage from "./pages/notification";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/user" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/user" element={<User />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* ✅ Only this route should exist */}
        <Route path="/workspace-documents" element={<WorkspaceDocuments />} />

        <Route path="/documents/:id" element={<Document />} />

        <Route
          path="*"
          element={
            <div className="text-center mt-20 text-3xl">Page Not Found</div>
          }
        />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
