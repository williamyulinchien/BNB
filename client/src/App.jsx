import {Route, Routes} from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import './App.css'
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import axios from 'axios'
import { UserContextProvider } from "./UserContext";
import ProfilePage from "./pages/ProfilePage";
import PlacesPage from "./pages/PlacesPage";
import PlacesFormPage from "./pages/PlacesFormPage";
import PlacePage from "./pages/PlacePage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
import ResetPage from "./pages/ResetPage";
import EmailResetPage from "./pages/EmailResetPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

axios.defaults.baseURL = 'http://127.0.0.1:4000';
axios.defaults.withCredentials = true;


function App() {
  return (
  <div>
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout/>}> //Parent
          <Route index element={<IndexPage/>} /> //child1
          <Route path ='/login' element={<LoginPage/>}/> //child2
          <Route path = '/reset' element={<ResetPage/>}/>
          <Route path ='/register' element={<RegisterPage/>}/>
          <Route path = '/forget-password' element = {<EmailResetPage/>}/>
          <Route path=  "/reset-password-email" element={<ResetPasswordPage/>} />
          <Route path = '/account' element = {<ProfilePage/>}/>
          <Route path = '/account/:subpage?' element={<PlacesPage/>}/>
          <Route path=  "/account/places/new" element={<PlacesFormPage />} />
          <Route path=  "/account/places/:id" element={<PlacesFormPage />} />
          <Route path=  "/place/:id" element={<PlacePage/>} />
          <Route path=  "/account/bookings" element={<BookingsPage />} />
          <Route path=  "/account/bookings/:id" element={<BookingPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  </div>
  )
}

export default App
