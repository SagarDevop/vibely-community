import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Auth from "./Pages/Auth";
import Feed from "./Pages/Feed";
import ProtectedRoute from "./Components/ProtectedRoute";
import VerticalNav from "./Components/VerticalNav";
import Profile from "./Components/Profile";
import EditProfile from "./Components/EditProfile";
import CreatePost from "./Components/CreatePost";
import Chatbox from './Components/Chatbox'
import AnotherUserProfile from "./Components/AnotherUserProfile"


function Layout({ currentUser, onLogout }) {
  return (
    <div className="flex min-h-screen">
      <VerticalNav currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  const currentUser = localStorage.getItem("aceess");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/auth";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={<Auth onAuth={() => (window.location.href = "/feed")} />}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout currentUser={{ username: "You" }} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/feed" element={<Feed />} />
          <Route path="/search" element={<div className="p-6">Search Page</div>} />
          <Route path="/post" element={<CreatePost/>} />
          <Route path="/message" element={<Chatbox/>} />
          <Route path="/notifications" element={<div className="p-6">Notifications</div>} />
          <Route path="/profile/:username" element={<Profile/>} />
          <Route path="/user/:userId" element={<AnotherUserProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />

        </Route>

        {/* Default redirect */}
        <Route
          path="*"
          element={<Navigate to={currentUser ? "/feed" : "/auth"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
