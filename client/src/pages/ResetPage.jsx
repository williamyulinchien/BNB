import { useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import axios from 'axios'

export default function ResetPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [redirect, setRedirect] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  async function handleUpdateSubmit(ev) {
    ev.preventDefault();
    try {
      const { data } = await axios.put('/reset-password', {oldPassword,newPassword},{withCredentials:true});
      if (data === 'not login') {
        setRedirect(false);
      } else if (data === 'old password is not correct') {
        alert('Old Password is Incorrect');
        setOldPassword('');
        setNewPassword('');
      } else if (data ==='update successfully'){
        alert('Reset successfully');
        setRedirect(false);
      }
    } catch (e) {
        alert(e)
        alert('Login failed due to a network or server error');
    }
  }
  if (!redirect) {
    return <Navigate to={'/'} />
  }
  
  
  return (
    <div className="mt-4 grow flex items-center justify-around">
    <div className="mb-64">
      <h1 className="text-4xl text-center mb-4">Update Password</h1>
      <form className="max-w-md mx-auto" onSubmit={handleUpdateSubmit}>
        <div className="grow flex items-center justify-around">
          <input
            className="flex-grow"
            type={showPassword ? "text" : "password"}
            placeholder="old password"
            value={oldPassword}
            onChange={ev => setOldPassword(ev.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ?
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
              :<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
          </span>
        </div>
        <div className="grow flex items-center justify-around">
          <input
            className="flex-grow"
            type={showPassword ? "text" : "password"}
            placeholder="new password"
            value={newPassword}
            onChange={ev => setNewPassword(ev.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ?
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
              :<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
          </span>
        </div>
        <hr/>
        <div className="flex items-center justify-center mt-4">
         
        </div>
        <hr/>
        <button className="primary mt-3">Reset Password</button>
      </form>
    </div>
  </div>
  )
}