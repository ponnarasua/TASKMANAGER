import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes ,Route, Outlet, Navigate } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Auth Pages - loaded immediately (small, needed first)
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Lazy loaded Admin Pages
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const ManageTasks = lazy(() => import('./pages/Admin/ManageTasks'));
const CreateTasks = lazy(() => import('./pages/Admin/CreateTasks'));
const ManageUsers = lazy(() => import('./pages/Admin/ManageUsers'));
const TeamProductivity = lazy(() => import('./pages/Admin/TeamProductivity'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));

// Lazy loaded User Pages
const UserDashboard = lazy(() => import('./pages/User/UserDashboard'));
const MyTasks = lazy(() => import('./pages/User/MyTasks'));
const ViewTaskDetails = lazy(() => import('./pages/User/ViewTaskDetails'));
const UserSettings = lazy(() => import('./pages/User/UserSettings'));

import PrivateRoute from './routes/PrivateRoute';
import UserProvider, {UserContext} from './context/userContext';
import ThemeProvider from './context/themeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);


const App = () => {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <UserProvider>

    <div>
      <Router>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-tasks/:taskId?" element={<CreateTasks />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/team-productivity" element={<TeamProductivity />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/task-details/:id" element={<ViewTaskDetails />} />
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoute allowedRoles={['member']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
            <Route path="/user/settings" element={<UserSettings />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Root />} />
        </Routes>
        </Suspense>
      </Router>
    </div>
    <Toaster 
      toastOptions={{
        className : "",
        style : {
          fontSize : "13px",
        },
      }}
    />
    </UserProvider>
    </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App;

const Root = () => {
  const {user, loading} = useContext(UserContext);

  if(loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if(!user){
    return <Navigate to="/login" replace />
  }

  return user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />;
};