import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { store } from '@/store';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all API cache data
    store.dispatch({ type: 'api/reset' });
    
    // Clear auth state
    dispatch(logout());
    
    // Navigate to login
    navigate('/login');
  };

  return {
    logout: handleLogout,
  };
}; 