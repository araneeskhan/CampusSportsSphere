import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../src/components/Sidebar';
import Home from '../src/components/Home';
import Login from '../src/components/Login';
import UploadItem from '../src/components/UploadItem';
import ManageItems from '../src/components/ManageItem';
import GenerateReport from '../src/components/GenerateReport';
import Alerts from '../src/components/LowStockAlert';
import styles from './App.css';
import EditItem from './components/EditItem';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    console.log('Auth status from localStorage:', authStatus);
    setIsAuthenticated(authStatus === 'true');
  }, []);

  useEffect(() => {
    console.log('isAuthenticated state changed:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <div className={styles.appContainer}>
        {isAuthenticated && (
          <>
             <Sidebar setIsAuthenticated={setIsAuthenticated} />
            {console.log('Rendering Sidebar')}
          </>
        )}
        <main className={styles.mainContent}>
          {console.log('Rendering main content')}
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Home setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/upload-item" element={<UploadItem />} />
                <Route path="/edit-item/:id" element={<EditItem />} />
                <Route path="/manage-items" element={<ManageItems />} />
                <Route path="/generate-report" element={<GenerateReport />} />
                <Route path="/low-stock-alert" element={<Alerts />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;