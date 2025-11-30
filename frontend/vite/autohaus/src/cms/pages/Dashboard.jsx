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
  const [impressionStats, setImpressionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impressionDays, setImpressionDays] = useState(30);

  useEffect(() => {
    fetchStats();
    fetchImpressionStats(impressionDays);
  }, []);

  useEffect(() => {
    fetchImpressionStats(impressionDays);
  }, [impressionDays]);

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

  const fetchImpressionStats = async (days) => {
    try {
      const response = await authAxiosInstance.get(`/api/impressions/stats/?days=${days}`);
      if (response.data.status === 'success') {
        setImpressionStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch impression stats:', error);
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

  // Impression chart data
  const impressionsOverTimeData = impressionStats?.by_date ? {
    labels: impressionStats.by_date.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Page Views',
        data: impressionStats.by_date.map(item => item.count),
        fill: true,
        borderColor: 'rgba(155, 89, 182, 1)',
        backgroundColor: 'rgba(155, 89, 182, 0.2)',
        tension: 0.4,
      },
    ],
  } : null;

  const impressionsByCityData = impressionStats?.by_city ? {
    labels: impressionStats.by_city.map(item => item.city || 'Unknown'),
    datasets: [
      {
        label: 'Views by City',
        data: impressionStats.by_city.map(item => item.count),
        backgroundColor: [
          'rgba(72, 181, 255, 0.6)',
          'rgba(155, 89, 182, 0.6)',
          'rgba(39, 174, 96, 0.6)',
          'rgba(241, 196, 15, 0.6)',
          'rgba(231, 76, 60, 0.6)',
          'rgba(52, 73, 94, 0.6)',
          'rgba(230, 126, 34, 0.6)',
          'rgba(26, 188, 156, 0.6)',
          'rgba(142, 68, 173, 0.6)',
          'rgba(44, 62, 80, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const topVehiclesData = impressionStats?.top_vehicles ? {
    labels: impressionStats.top_vehicles.map(item => item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name),
    datasets: [
      {
        label: 'Views',
        data: impressionStats.top_vehicles.map(item => item.impressions),
        backgroundColor: 'rgba(39, 174, 96, 0.6)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

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
          <h3>{stats.is_admin ? 'Total Vehicles' : 'My Vehicles'}</h3>
          <div className="value">{stats.total_vehicles || 0}</div>
        </div>
        <div className={styles.statCard}>
          <h3>{stats.is_admin ? 'Active Vehicles' : 'My Active Vehicles'}</h3>
          <div className="value">{stats.active_vehicles || 0}</div>
        </div>
        {stats.is_admin && (
          <div className={styles.statCard}>
            <h3>Total Users</h3>
            <div className="value">{stats.total_users || 0}</div>
          </div>
        )}
        {stats.is_admin && (
          <div className={styles.statCard}>
            <h3>Total Sellers</h3>
            <div className="value">{stats.total_sellers || 0}</div>
          </div>
        )}
        {stats.is_admin && (
          <div className={styles.statCard}>
            <h3>Contact Entries</h3>
            <div className="value">{stats.total_contact_entries || 0}</div>
          </div>
        )}
        <div className={styles.statCard}>
          <h3>{stats.is_admin ? 'Saved Listings' : 'My Saved Listings'}</h3>
          <div className="value">{stats.total_saved_listings || 0}</div>
        </div>
      </div>

      {/* Charts */}
      {stats.vehicles_by_make && stats.vehicles_by_make.length > 0 && (
        <div className={styles.chartContainer}>
          <h2>{stats.is_admin ? 'Vehicles by Make' : 'My Vehicles by Make'}</h2>
          <Bar data={vehiclesByMakeData} options={chartOptions} />
        </div>
      )}

      <div className={styles.chartContainer}>
        <h2>{stats.is_admin ? 'Vehicle Status' : 'My Vehicle Status'}</h2>
        <Doughnut data={vehiclesByStatusData} options={chartOptions} />
      </div>

      {stats.recent_activity_labels && stats.recent_activity_labels.length > 0 && (
        <div className={styles.chartContainer}>
          <h2>Recent Activity</h2>
          <Line data={recentActivityData} options={chartOptions} />
        </div>
      )}

      {/* Impression Statistics Section */}
      {impressionStats && (
        <>
          <div className={styles.sectionHeader}>
            <h2>Page View Analytics</h2>
            <select
              value={impressionDays}
              onChange={(e) => setImpressionDays(parseInt(e.target.value))}
              className={styles.periodSelect}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          {/* Impression Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Page Views</h3>
              <div className="value">{impressionStats.total_impressions || 0}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Unique Visitors</h3>
              <div className="value">{impressionStats.unique_visitors || 0}</div>
            </div>
          </div>

          {/* Impressions Over Time Chart */}
          {impressionsOverTimeData && impressionsOverTimeData.labels.length > 0 && (
            <div className={styles.chartContainer}>
              <h2>Page Views Over Time</h2>
              <Line data={impressionsOverTimeData} options={chartOptions} />
            </div>
          )}

          {/* Top Vehicles Chart */}
          {topVehiclesData && topVehiclesData.labels.length > 0 && (
            <div className={styles.chartContainer}>
              <h2>Most Viewed Vehicles</h2>
              <Bar data={topVehiclesData} options={{
                ...chartOptions,
                indexAxis: 'y',
              }} />
            </div>
          )}

          {/* Impressions by City Chart */}
          {impressionsByCityData && impressionsByCityData.labels.length > 0 && (
            <div className={styles.chartContainer}>
              <h2>Views by City</h2>
              <Doughnut data={impressionsByCityData} options={chartOptions} />
            </div>
          )}

          {/* Top Locations Table */}
          {impressionStats.by_city && impressionStats.by_city.length > 0 && (
            <div className={styles.chartContainer}>
              <h2>Top Cities</h2>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>City</th>
                    <th>Region</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {impressionStats.by_city.map((city, index) => (
                    <tr key={index}>
                      <td>{city.city || 'Unknown'}</td>
                      <td>{city.region || '-'}</td>
                      <td>{city.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Impressions Table */}
          {impressionStats.recent_impressions && impressionStats.recent_impressions.length > 0 && (
            <div className={styles.chartContainer}>
              <h2>Recent Page Views</h2>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Location</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {impressionStats.recent_impressions.slice(0, 20).map((imp, index) => (
                    <tr key={index}>
                      <td>{imp.vehicle_name}</td>
                      <td>{imp.city || 'Unknown'}</td>
                      <td>{new Date(imp.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
