import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import authAxiosInstance from '../../utils/http';
import useStore from '../../store';
import styles from '../styles/cms.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { addToast } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.get('/api/cms/dashboard-stats/');
      
        setStats(response.data);
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      addToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <ClipLoader color="#48B5FF" size={50} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.dashboardPage}>
        <h1>Dashboard</h1>
        <p>No statistics available</p>
      </div>
    );
  }

  // Prepare chart data
  const vehiclesByMakeData = {
    labels: stats.vehicles_by_make?.map((item) => item.make__name) || [],
    datasets: [
      {
        label: 'Vehicles',
        data: stats.vehicles_by_make?.map((item) => item.count) || [],
        backgroundColor: 'rgba(72, 181, 255, 0.6)',
        borderColor: 'rgba(72, 181, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const vehiclesByStatusData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        label: 'Status',
        data: [stats.active_vehicles || 0, (stats.total_vehicles || 0) - (stats.active_vehicles || 0)],
        backgroundColor: ['rgba(39, 174, 96, 0.6)', 'rgba(231, 76, 60, 0.6)'],
        borderColor: ['rgba(39, 174, 96, 1)', 'rgba(231, 76, 60, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const recentActivityData = {
    labels: stats.recent_activity_labels || [],
    datasets: [
      {
        label: 'Activities',
        data: stats.recent_activity_counts || [],
        fill: false,
        borderColor: 'rgba(72, 181, 255, 1)',
        backgroundColor: 'rgba(72, 181, 255, 0.6)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className={styles.dashboardPage}>
      <h1>Dashboard</h1>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Vehicles</h3>
          <div className="value">{stats.total_vehicles || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Active Vehicles</h3>
          <div className="value">{stats.active_vehicles || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <div className="value">{stats.total_users || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Sellers</h3>
          <div className="value">{stats.total_sellers || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Contact Entries</h3>
          <div className="value">{stats.total_contact_entries || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Saved Listings</h3>
          <div className="value">{stats.total_saved_listings || 0}</div>
        </div>
      </div>

      {/* Charts */}
      {stats.vehicles_by_make && stats.vehicles_by_make.length > 0 && (
        <div className={styles.chartContainer}>
          <h2>Vehicles by Make</h2>
          <Bar data={vehiclesByMakeData} options={chartOptions} />
        </div>
      )}

      <div className={styles.chartContainer}>
        <h2>Vehicle Status</h2>
        <Doughnut data={vehiclesByStatusData} options={chartOptions} />
      </div>

      {stats.recent_activity_labels && stats.recent_activity_labels.length > 0 && (
        <div className={styles.chartContainer}>
          <h2>Recent Activity</h2>
          <Line data={recentActivityData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
