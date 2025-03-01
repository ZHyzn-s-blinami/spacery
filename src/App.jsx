import { Route, Routes, useNavigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import HomeAdmin from './pages/HomeAdmin';
import BookingList from './pages/BookingList';

function App() {
  const userToken = localStorage.getItem('userToken');
  const navigate = useNavigate();

  if (!userToken) {
    navigate('/auth');
  }
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="/admin" element={<HomeAdmin />} />
        <Route path="/admin/booking/:uuid/place" element={<BookingList />} />
      </Route>
    </Routes>
  );
}

export default App;
