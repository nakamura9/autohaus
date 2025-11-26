import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useStore from '../../store';
import CMSNavbar from './CMSNavbar';
import Toast from './Toast';
import styles from '../styles/cms.module.css';

const CMSRoot = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();

  useEffect(() => {
    // Check if user is authenticated and has CMS access
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!user?.is_cms_user && !user?.is_superuser) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything if not authorized
  if (!isAuthenticated || (!user?.is_cms_user && !user?.is_superuser)) {
    return null;
  }

  return (
    <div className={styles.cmsRoot}>
      <CMSNavbar />
      <div className={styles.cmsContent}>
        <Outlet />
      </div>
      <Toast />
    </div>
  );
};

export default CMSRoot;
