import { Route, Routes } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

function App() {

  return (
    <Routes>
      <Route path='/' element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path='/auth' element={<Auth />} />
      </Route>
    </Routes>
  )
}

export default App
