import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import './App.css';
import { useEffect } from 'react';
import { useUser } from './context/usercontext';
import { FlyToCart } from './components/FlyToCart';

function App() {
  const { checkToken } = useUser();

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Router>
      <AppRoutes />
      <FlyToCart />
    </Router>
  );
}

export default App;
