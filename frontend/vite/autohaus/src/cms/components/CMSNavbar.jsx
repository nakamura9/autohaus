import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faChartLine,
  faSignOutAlt,
  faUser,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import useStore from '../../store';
import styles from '../styles/cms.module.css';

const CMSNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarBrand}>
          <Link to="/cms">AutoHaus CMS</Link>
        </div>

        <button className={styles.navbarToggle} onClick={toggleMenu}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

        <div className={`${styles.navbarMenu} ${menuOpen ? styles.active : ''}`}>
          <Link to="/" className={styles.navbarLink} onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faGlobe} />
            <span>Go To Site</span>
          </Link>

          <Link to="/cms/dashboard" className={styles.navbarLink} onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faChartLine} />
            <span>Dashboard</span>
          </Link>

          <div className={styles.navbarUser}>
            <FontAwesomeIcon icon={faUser} />
            <span>{user?.username || 'User'}</span>
          </div>

          <button className={styles.navbarLink} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default CMSNavbar;
