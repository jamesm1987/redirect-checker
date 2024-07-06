import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResults(null);

    try {
      const response = await fetch('/.netlify/functions/checkRedirects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Redirect Checker</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
          />
          <button type="submit">Check Redirects</button>
        </form>
        {error && <p className="error">{error}</p>}
        {results && (
          <div>
            <h2>Redirects:</h2>
            <ul>
              {results.redirects.map((redirect, index) => (
                <li key={index}>
                  From: {redirect.from}, To: {redirect.to}, Status Code: {redirect.status_code}
                </li>
              ))}
            </ul>
            <h2>Final Result:</h2>
            <p>Final URL: {results.final_result.final_url}, Status Code: {results.final_result.status_code}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;