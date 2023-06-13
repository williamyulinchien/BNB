import { useState } from "react"
import axios from "axios";
export default function EmailResetPage() {
    const [email,setEmail] = useState('')

    async function handleResetSubmit(ev) {
        ev.preventDefault();
        try {
          const {data} = await axios.post('/password-email', {email},{withCredentials:true});
          if (data === 'not found') {
            alert('No user exists with that email');
          }else {
            alert('Reset Link has sent to your email!');
          }
        } catch (e) {
            alert('failed due to a network or server error');
        }
      }



  return (
    <div className="mt-4 grow flex items-center justify-around">
    <div className="mb-64">
      <h1 className="text-4xl text-center mb-4">Reset Password</h1>
      <form className="max-w-md mx-auto"onSubmit={handleResetSubmit}>
        <input type="email"
                placeholder="your@email.com"
                value={email}
                onChange={ev => setEmail(ev.target.value)} />
        <button className="primary mt-3">Confirm</button>
        </form>
    </div>
    </div>
  )
}
