import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import { API_DOMAIN_LOCAL } from '../domain';



function Login() {
  const [password, setPassword] = useState('owner');
  const navigate = useNavigate();

  const onLogin = () => {
    const path =  API_DOMAIN_LOCAL + `api/owner/login`;
    
    fetch(path, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "ownerPassword": password
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1) {
        localStorage.setItem("key", data.data);
        navigate('/resource/foodservice/dashboard');
      } else {
        console.error("Invalid password");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: '#383854', minHeight: '100vh' }}>
      <div>
        <h1 className="text-center mb-4" style={{ color: 'white' }}>Login</h1>
        <form>
          <div className="mb-4">
            <div className="form-floating">
              <input 
                type="password" 
                className="form-control" 
                id="floatingPassword" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ borderRadius: '20px' }}
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
          </div>
          <div className="d-grid">
            <button type="button" className="btn fw-bold" onClick={onLogin}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;