import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      alert("Authentication Error: " + err.message);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#4f46e5', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          MY JOB LOG
        </h1>
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </p>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', outline: 'none' }}
          />
          <button 
            type="submit"
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#4f46e5', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            {isRegistering ? 'アカウント作成 (Sign Up)' : 'ログイン (Login)'}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ width: '100%', marginTop: '1.5rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegistering ? '既にアカウントをお持ちの方 (Log in instead)' : '新しくアカウントを作る (Create an account)'}
        </button>
      </div>
    </div>
  );
}
