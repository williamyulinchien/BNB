import { useState } from 'react';
import axios from 'axios';
import { Navigate, useLocation } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const location = useLocation();
  const [redirect, setRedirect] = useState(false)
//   console.log(location)
//   console.log(password1)
//   console.log(password2)
  
  const token = new URLSearchParams(location.search).get('token');
//   console.log('token: ',token)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password1 !== password2) {
        alert('Passwords do not match!');
        return;
      }
    try {
      const response = await axios.post('/reset-password-email', {token, password1,password2 });
      alert(response.data.message);
      setRedirect(true)
    } catch (error) {
      alert('An error occurred while resetting your password.');
    }
  };
  if (redirect){
    return <Navigate to={'/login'} />
  }
  
  return (
    <div className="mt-4 grow flex items-center justify-around">
    <div className="mb-64">
      <h1 className="text-4xl text-center mb-4">Reset Password</h1>
    <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
      <input
        type="password"
        value={password1}
        onChange={(e) => setPassword1(e.target.value)}
        placeholder="Enter new password"
        required
      />
        <input
        type="password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        placeholder="Re-enter new password"
        required
      />
      
      <button className="primary mt-3">Reset Password</button>
    </form>
    </div>
    </div>
  );
}
