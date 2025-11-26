import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import useStore from '../../store';
import styles from '../styles/cms.module.css';

const Toast = () => {
  const { toasts, removeToast } = useStore();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'info':
      default:
        return faInfoCircle;
    }
  };

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <FontAwesomeIcon icon={getIcon(toast.type)} className={styles.toastIcon} />
          <span className={styles.toastMessage}>{toast.message}</span>
          <button
            className={styles.toastClose}
            onClick={() => removeToast(toast.id)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
