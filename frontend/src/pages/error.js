import React from 'react';
import { useRouteError } from 'react-router-dom';
import '../styles/ErrorPage.css'; // We'll create this CSS file

function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="error-page">
      <div className="error-container">
        <h1>Oops!</h1>
        <p className="error-message">Sorry, an unexpected error has occurred.</p>
        <p className="error-details">
          <i>{error.statusText || error.message}</i>
        </p>
        <button onClick={() => window.location.href = '/'}>
          Return to Homepage
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;