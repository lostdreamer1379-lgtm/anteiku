import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home/Home";
import Explore from "./pages/Explore/Explore";
import Seasonal from "./pages/Seasonal/Seasonal";
import Watchlist from "./pages/Watchlist/Watchlist";
import AnimeDetails from "./pages/AnimeDetails/AnimeDetails";
import Watch from "./pages/Watch/Watch";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ResetPassword from "./pages/Auth/ResetPassword";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound";
import Manga from "./pages/Manga/Manga";
import MangaDetails from "./pages/Manga/MangaDetails";
import MangaReader from "./pages/Manga/MangaReader";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/seasonal" element={<Seasonal />} />
          <Route path="/manga" element={<Manga />} />
          <Route path="/manga/:id/read/:chapterId" element={<MangaReader />} />
          <Route path="/manga/:id" element={<MangaDetails />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes — require a valid Supabase session */}
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:id/:episode"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
