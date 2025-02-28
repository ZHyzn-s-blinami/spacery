import { Route, Routes } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import Auth from "./pages/Auth";

function App() {

  return (
    <Routes>
      <Route path='/' element={<UserLayout />}>
        <Route path='/auth' element={<Auth />} />
      </Route>
      <Route path='/admin' element={<AdminLayout />}>

      </Route>
    </Routes>
  )
}

export default App
