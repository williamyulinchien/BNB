import React, { useContext, useEffect } from 'react'
import { useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import axios from 'axios'
import { UserContext } from '../UserContext';
import { Base64 } from 'js-base64';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [captcha, setCaptcha] = useState('')
  const {setUser} = useContext(UserContext)
  const [captchaImage, setCaptchaImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    getCaptchaImage();
  }
  , []);

  async function getCaptchaImage() {
    try {
      const response = await axios.get('/captcha', { responseType: 'arraybuffer' });
      const base64 = Base64.fromUint8Array(new Uint8Array(response.data));
      setCaptchaImage(`data:image/svg+xml;base64,${base64}`);
    } catch (error) {
      console.error(error);
    }
  }
  async function handleResetCaptcha() {
    getCaptchaImage();
  }
  
  
  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
      const { data } = await axios.post('/login', { email, password,captcha},{withCredentials:true});
      if (data === 'not found') {
        alert('Email not found');
      } else if (data === 'password not ok') {
        alert('Incorrect password');
      } else if (data === 'captcha not ok') {
          alert('Incorrect captcha');
      } else {
        setUser(data);
        alert('Login successful');
        setRedirect(true);
      }
    } catch (e) {
        alert('Login failed due to a network or server error');
    }
  }
  if (redirect) {
    return <Navigate to={'/'} />
  }
  
  
  return (
    <div className="mt-4 grow flex items-center justify-around">
    <div className="mb-64">
      <h1 className="text-4xl text-center mb-4">Login</h1>
      <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
        <input type="email"
                placeholder="your@email.com"
                value={email}
                onChange={ev => setEmail(ev.target.value)} />
        <div className="grow flex items-center justify-around">
          <input
            className="flex-grow"
            type={showPassword ? "text" : "password"}
            placeholder="password"
            value={password}
            onChange={ev => setPassword(ev.target.value)}
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
          <div className="flex center">
            <img className="text mb-5" src={captchaImage} alt="Captcha" />
            <button type="button" onClick={handleResetCaptcha}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 h-9 bg-primary rounded-2xl">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
            </svg> 
            </button>
          </div>
        </div>
        <input  className="flex items-center justify-center mt-5"
                type = 'text'
                placeholder='Captcha'
                value={captcha}
                onChange={ev => setCaptcha(ev.target.value)} />
        <hr/>
        <button className="primary mt-3">Login</button>
           </form>
        <div className="text-center pt-5 text-gray-500">
          Don't have an account yet? &nbsp;&nbsp;
          <Link className="underline text-black" to={'/register'}>Register now</Link>
        </div>
        <div className="text-center py-1 text-gray-500">
          Password forget? &nbsp;&nbsp;
          <Link className="underline text-black" to={'/forget-password'}>Reset Password</Link>
        </div>
     
    </div>
  </div>
  )
}
