import { Route, Routes, useNavigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import HomeAdmin from './pages/HomeAdmin';
import BookingList from './pages/BookingList';
import { Toaster } from 'react-hot-toast';
import ProtectedUserRoute from './components/ProtectedUserRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import UserControl from './pages/UserControl';
import TicketList from './pages/TicketList';
import CheckQr from './pages/CheckQr.jsx';
import MeetingsPage from './pages/MeetingsPage.jsx';
import UserConfirm from './pages/UserConfirm.jsx';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            padding: '16px',
            fontWeight: '500',
            fontSize: '14px',
          },

          success: {
            duration: 2000,
            style: {
              background: '#edf7ed',
              color: '#1e4620',
              border: '1px solid #c6e7c6',
            },
            iconTheme: {
              primary: '#4caf50',
              secondary: '#ffffff',
            },
          },

          error: {
            duration: 4000,
            style: {
              background: '#fdeded',
              color: '#5f2120',
              border: '1px solid #f5c9c9',
            },
            iconTheme: {
              primary: '#f44336',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedUserRoute>
              <UserLayout />
            </ProtectedUserRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/meetings" element={<MeetingsPage />} />
        </Route>
        <Route path="/userConfirm/:jwt" element={<UserConfirm />} />
        <Route path="/checkQr/:jwt" element={<CheckQr />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/admin/booking/:name/place" element={<BookingList />} />
          <Route path="/admin/userControl" element={<UserControl />} />
          <Route path="/admin/tickets" element={<TicketList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
