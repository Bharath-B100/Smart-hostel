import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { currentUser } = useAuth();
  return (
    <>
      <Header />
      <div className="container">
        <div className="main-content" style={{ gridTemplateColumns: currentUser?.isAdmin ? '1fr 3fr' : '1fr' }}>
          <Sidebar />
          <main className="content-area">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
