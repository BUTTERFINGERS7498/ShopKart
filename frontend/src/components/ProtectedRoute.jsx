import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;

    api
      .get('/customers/me')
      .then(() => {
        if (active) setStatus('ok');
      })
      .catch(() => {
        if (active) setStatus('denied');
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <main className="page-center" aria-busy="true">
        <p>Checking your session...</p>
      </main>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
