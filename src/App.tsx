import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AuthForm } from './components/AuthForm';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="app-container">
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
