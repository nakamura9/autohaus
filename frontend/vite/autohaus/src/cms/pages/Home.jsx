import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faBuilding,
  faUsers,
  faQuestionCircle,
  faEnvelope,
  faCog,
  faClipboardList,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import useStore from '../../store';
import authAxiosInstance from '../../utils/http';
import styles from '../styles/cms.module.css';

const Home = () => {
  const { user, hasPermission, setPermissions, addToast } = useStore();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user permissions
    const fetchPermissions = async () => {
      try {
        const response = await authAxiosInstance.get('/api/cms/current-user-permissions/');
        if (response.data.success) {
          setPermissions(response.data.permissions);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        addToast('Failed to load permissions', 'error');
      }
    };

    fetchPermissions();
  }, [setPermissions, addToast]);

  useEffect(() => {
    // Fetch recent activity (audit logs)
    const fetchRecentActivity = async () => {
      try {
        const response = await authAxiosInstance.get('/api/cms/list/auditlog/', {
          params: { page: 1, page_size: 10 },
        });
        if (response.data) {
          setRecentActivity(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const modelCategories = [
    {
      title: 'Vehicle Management',
      models: [
        { name: 'vehicle', label: 'Vehicles', icon: faCar, description: 'Manage vehicle listings' },
        { name: 'make', label: 'Makes', icon: faBuilding, description: 'Vehicle manufacturers' },
        { name: 'model', label: 'Models', icon: faCar, description: 'Vehicle models' },
        { name: 'vehiclephoto', label: 'Photos', icon: faClipboardList, description: 'Vehicle images' },
      ],
    },
    {
      title: 'User Management',
      models: [
        { name: 'seller', label: 'Sellers', icon: faUsers, description: 'Manage sellers' },
        { name: 'account', label: 'Accounts', icon: faUsers, description: 'User accounts' },
        { name: 'role', label: 'Roles', icon: faCog, description: 'User roles & permissions' },
      ],
    },
    {
      title: 'Content Management',
      models: [
        { name: 'faq', label: 'FAQs', icon: faQuestionCircle, description: 'Frequently asked questions' },
        { name: 'faqcategory', label: 'FAQ Categories', icon: faQuestionCircle, description: 'FAQ categories' },
        { name: 'contactentry', label: 'Contact Entries', icon: faEnvelope, description: 'Contact form submissions' },
      ],
    },
    {
      title: 'Configuration',
      models: [
        { name: 'city', label: 'Cities', icon: faBuilding, description: 'Available cities' },
        { name: 'currency', label: 'Currencies', icon: faCog, description: 'Currency settings' },
        { name: 'setting', label: 'Settings', icon: faCog, description: 'Application settings' },
      ],
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.homeHeader}>
        <h1>Welcome, {user?.first_name || user?.username}!</h1>
        <p>Manage your AutoHaus content from this dashboard</p>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentActivity}>
        <h2>
          <FontAwesomeIcon icon={faHistory} /> Recent Activity
        </h2>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : recentActivity.length > 0 ? (
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <FontAwesomeIcon icon={faClipboardList} />
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{activity.title}</div>
                  <div className={styles.activityMeta}>
                    {activity.created_by?.username || 'System'} • {formatDate(activity.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noActivity}>No recent activity</div>
        )}
      </div>

      {/* Model Categories */}
      {modelCategories.map((category) => (
        <div key={category.title} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>{category.title}</h2>
          <div className={styles.modelGrid}>
            {category.models.map((model) => {
              const canRead = hasPermission(model.name, 'read');

              if (!canRead) return null;

              return (
                <Link
                  key={model.name}
                  to={`/cms/list/${model.name}`}
                  className={styles.modelCard}
                >
                  <div className={styles.modelCardIcon}>
                    <FontAwesomeIcon icon={model.icon} />
                  </div>
                  <div className={styles.modelCardName}>{model.label}</div>
                  <div className={styles.modelCardDescription}>
                    {model.description}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
