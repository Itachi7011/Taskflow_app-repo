import { useContext } from "react";
import { Routes, Route } from "react-router-dom";

// ---- providers ----
import { ThemeContext, ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

// ---- layout ----
import PublicLayout from "./components/PublicLayout/PublicLayout";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import AdminProtectedRoute from "./components/Routes/AdminProtectedRoute";

// ---- core pages ----
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateTask from "./pages/tasks/CreateTask";
import TaskDetail from "./pages/tasks/TaskDetail";

// ---- user auth pages ----
import UserLogin from "./pages/userAuth/UserLogin";
import UserSignup from "./pages/userAuth/UserSignup";
import UserForgotPassword from "./pages/userAuth/UserForgotPassword";
import UserEmailVerification from "./pages/userAuth/UserEmailVerification";

// ---- admin auth pages ----
import AdminLogin from "./pages/adminAuth/Login";
import AdminSignup from "./pages/adminAuth/Signup";
import AdminForgotPassword from "./pages/adminAuth/ForgotPassword";
import AdminEmailVerification from "./pages/adminAuth/EmailVerification";

// ---- admin pages ----
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

// ---- static pages ----
import AboutUs from "./pages/static/AboutUs";
import ContactUs from "./pages/static/ContactUs";
import Services from "./pages/static/Services";
import Terms from "./pages/static/Terms";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import FAQs from "./pages/static/FAQs";
import ReportIssue from "./pages/static/ReportIssue";
import ComingSoonFeatures from "./pages/static/ComingSoonFeatures";
import NotFound404 from "./pages/static/NotFound404";

// ---- ALL css imported here manually, exactly once, in one spot ----
// shared tokens first, then components, then pages
import "./styles/taskflow-theme.css";
import "./components/Navbar/navbar.css";
import "./components/Footer/footer.css";
import "./components/FloatingActionButton/floatingActionButton.css";
import "./components/AdminNavbar/adminNavbar.css";
import "./components/AdminSidebar/adminSidebar.css";
import "./components/AdminLayout/adminLayout.css";
import "./pages/userAuth/UserAuth.css";
import "./pages/adminAuth/AdminAuth.css";
import "./pages/home/home.css";
import "./pages/dashboard/dashboard.css";
import "./pages/tasks/createTask.css";
import "./pages/tasks/taskDetail.css";
import "./pages/admin/adminDashboard.css";
import "./pages/admin/adminTasks.css";
import "./pages/admin/adminUsers.css";
import "./pages/admin/adminSettings.css";
import "./pages/static/StaticPages.css";
import "./pages/static/NotFound404.css";

function ThemedShell({ children }) {
  // this div is what actually carries the .dark / .light class down to
  // every single page, the navbar/footer also add the class themselves
  // for their own scoped styles but this outer one is what matters for
  // the shared --tf-* variables to reach pages that dont set it directly
  const { isDarkMode } = useContext(ThemeContext);
  return <div className={`taskflow-app ${isDarkMode ? "dark" : "light"}`}>{children}</div>;
}

function App() {
  return (
    <ThemeProvider>
      <ThemedShell>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
            {/* ---------- public + user pages (share Navbar/Footer/FAB) ---------- */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><UserLogin /></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><UserSignup /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><UserForgotPassword /></PublicLayout>} />
            <Route path="/reset-password/:token" element={<PublicLayout><UserForgotPassword /></PublicLayout>} />
            <Route path="/verify-email/:token" element={<PublicLayout><UserEmailVerification /></PublicLayout>} />

            <Route
              path="/dashboard"
              element={
                <PublicLayout>
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                </PublicLayout>
              }
            />
            <Route
              path="/dashboard/new"
              element={
                <PublicLayout>
                  <ProtectedRoute><CreateTask /></ProtectedRoute>
                </PublicLayout>
              }
            />
            <Route
              path="/dashboard/tasks/:id"
              element={
                <PublicLayout>
                  <ProtectedRoute><TaskDetail /></ProtectedRoute>
                </PublicLayout>
              }
            />

            <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/faqs" element={<PublicLayout><FAQs /></PublicLayout>} />
            <Route path="/report-issue" element={<PublicLayout><ReportIssue /></PublicLayout>} />
            <Route path="/coming-soon" element={<PublicLayout><ComingSoonFeatures /></PublicLayout>} />

            {/* ---------- admin auth (no navbar/footer, own layout) ---------- */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password/:token" element={<AdminForgotPassword />} />
            <Route path="/admin/verify-email/:token" element={<AdminEmailVerification />} />

            {/* ---------- admin dashboard (own AdminNavbar/AdminSidebar layout) ---------- */}
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/tasks" element={<AdminProtectedRoute><AdminTasks /></AdminProtectedRoute>} />
            <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
            <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />

            {/* ---------- 404 ---------- */}
            <Route path="*" element={<PublicLayout><NotFound404 /></PublicLayout>} />
          </Routes>
          </SidebarProvider>
        </AuthProvider>
      </ThemedShell>
    </ThemeProvider>
  );
}

export default App;
