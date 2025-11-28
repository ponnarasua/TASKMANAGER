import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes ,Route, Outlet, Navigate } from "react-router-dom";
// Auth Pages
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';
// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTasks from './pages/Admin/CreateTasks';
import ManageUsers from './pages/Admin/ManageUsers';
import AdminSettings from './pages/Admin/AdminSettings';
// User Pages
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import UserSettings from './pages/User/UserSettings';

import PrivateRoute from './routes/PrivateRoute';
import UserProvider, {UserContext} from './context/userContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';


const App = () => {
  return (
    <ErrorBoundary>
    <UserProvider>

    <div>
      <Router>
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
            <Route path="/admin/settings" element={<AdminSettings />} />
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