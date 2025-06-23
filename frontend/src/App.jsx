import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';
import MainLayout from './components/layout/MainLayout';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContextProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



// Context Providers
import { EnterpriseContextProvider } from './context/EnterpriseContext';

import AddFeature from './pages/features/AddFeature';
import { FeatureContextProvider } from './context/FeatureContext';
import FeatureList from './pages/features/FeatureList';
import UpdateFeature from './pages/features/updateFeature';
import { useState } from 'react';
import ForgotPassword from './pages/accounts/ForgotPassword';
import ResetPassword from './pages/accounts/ResetPassword';
import UserList from './pages/users/UserList';

import EnterpriseList from './pages/enterprises/EnterpriseList';
import AddEnterprise from './pages/enterprises/AddEnterprise';
import UpdateEnterprise from './pages/enterprises/UpdateEnterprise';
import { TraineeContextProvider } from './context/TraineeContext';
import TraineeList from './pages/trainees/TraineeList';
import AddTrainee from './pages/trainees/AddTrainee';
import UpdateTrainee from './pages/trainees/UpdateTrainee';
import { SessionContextProvider } from './context/SessionContext';
import SessionList from './pages/sessions/SessionList';
import AddSession from './pages/sessions/AddSession';
import UpdateSession from './pages/sessions/UpdateSession';

AOS.init({ once: false });

function App() {
  const location = useLocation();
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthContextProvider>
      <div className="flex flex-col min-h-screen">
        {/* Navbar is shown on all routes except login and register */}
        {!isPublicRoute && <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />}
        
        <div className="flex flex-1 w-full">
          {/* Sidebar is shown on all routes except login and register */}
          {!isPublicRoute && <Sidebar isOpen={isSidebarOpen}  closeSidebar={() => setIsSidebarOpen(false)} />}
          
          <div className="flex-1 transition-all duration-300 w-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:email" element={<ResetPassword />} />
              
              {/* Protected Routes with Multiple Contexts and MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={
                  <MultiContextProvider>
                    <MainLayout />
                  </MultiContextProvider>
                }>
                  {/* Dashboard route */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  

                  

                  
                  {/* Feature Routes */}
                  <Route path='/features'>
                    <Route index element={<FeatureList />} />
                    <Route path='add' element={<AddFeature />} />
                    <Route path="edit/:id" element={<UpdateFeature />} />
                  </Route>

                  {/* Enterprise Routes */}
                  <Route path='/enterprises'>
                    <Route index element={<EnterpriseList />} />
                    <Route path='add' element={<AddEnterprise />} />
                    <Route path="edit/:id" element={<UpdateEnterprise />} />
                  </Route>

                  {/* Enterprise Routes */}
                  <Route path='/participants'>
                    <Route index element={<TraineeList />} />
                    <Route path='add' element={<AddTrainee />} />
                    <Route path="edit/:id" element={<UpdateTrainee />} />
                  </Route>

                  {/* Enterprise Routes */}
                  <Route path='/sessions'>
                    <Route index element={<SessionList />} />
                    <Route path='add' element={<AddSession />} />
                    <Route path="edit/:id" element={<UpdateSession />} />
                  </Route>


                  
                  
                  <Route path='/users' element={<UserList />} />
                </Route>
              </Route>
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      </div>
    </AuthContextProvider>
  );
}

// Component to wrap multiple context providers - now includes AdminTaskContext
const MultiContextProvider = ({ children }) => {
  return (
          <FeatureContextProvider>
                <EnterpriseContextProvider>
                  <TraineeContextProvider>
                    <SessionContextProvider>
                      {children}
                    </SessionContextProvider>
                  </TraineeContextProvider>
                </EnterpriseContextProvider>
              
          </FeatureContextProvider>
  );
};

export default App;