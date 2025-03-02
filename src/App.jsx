import { Route, Routes, useNavigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import HomeAdmin from './pages/HomeAdmin';
import BookingList from './pages/BookingList';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            padding: '16px',
            fontWeight: '500',
            fontSize: '14px',
          },

          success: {
            duration: 3000,
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
            duration: 5000,
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
        <Route path="/" element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/admin/booking/:name/place" element={<BookingList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
