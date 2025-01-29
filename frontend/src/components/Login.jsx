import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import styles from './login.module.css';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      console.error('Error during login:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/invalid-email':
          toast.error('Invalid email address.');
          break;
        case 'auth/user-disabled':
          toast.error('This user account has been disabled.');
          break;
        case 'auth/user-not-found':
          toast.error('No user found with this email.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password.');
          break;
        default:
          toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.loginCard}
      >
        <h2 className={styles.loginTitle}>Welcome Admin</h2>
        <p className={styles.loginSubtitle}>Please sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaUser className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.loginButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;