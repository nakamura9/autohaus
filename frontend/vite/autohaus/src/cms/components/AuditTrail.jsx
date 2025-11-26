import React from 'react';
import authAxiosInstance from '../../utils/http';

const styles = {
  timeline: {
    borderLeft: '4px solid black',
    height: '200px',
    marginLeft: '24px',
  },
  ticker: {
    width: '24px',
    height: '24px',
    border: '2px solid black',
  },
};

const AuditTrail = ({ entity, id }) => {
  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    authAxiosInstance
      .get(`/api/cms/audit-trail/${entity}/${id}/`)
      .then((res) => {
        setLogs(res.data.logs);
      })
      .catch((err) => {
        console.error('Failed to fetch audit logs:', err);
      });
  }, [entity, id]);

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold mb-4">File History</h4>
      <div className="p-4 pt-8 bg-white rounded relative">
        <div
          style={{ ...styles.timeline, height: `${48 + logs.length * 96}px` }}
        ></div>
        {logs.map((log, i) => (
          <div
            key={i}
            className="flex align-center absolute"
            style={{ top: `${48 + i * 96}px`, left: '30px' }}
          >
            <div
              style={styles.ticker}
              className="rounded-full bg-white"
            ></div>
            <div className="ml-4">
              <p>
                <b>{log.title}</b>
                <br />
                <small>{log.human_date}</small>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;
