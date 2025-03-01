import { Route, Routes } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path='/' element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/profile' element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
