import React, { useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [inputType, setInputType] = useState('textarea');
  const [urls, setUrls] = useState([]);
  const [textareaContent, setTextareaContent] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const cleanUrls = (urls) => {
    return urls.map(url => {

      url = url.trim();      
      url = url.replace(/[\r\n]+/g, '');
      url = url.replace(/['"]/g, '');
      url = url.replace(/\s+/g, ' ');
      
      return url;
    }).filter(url => url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0]

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const extractedUrls = result.data.map(row =>row[0]);
          const cleanedUrls = cleanUrls(extractedUrls);
          setUrls(cleanedUrls);
        },
        header: false,
      });
    }
  };

  const handleTextareaChange = (event) => {
    setTextareaContent(event.target.value);
  };

  const processTextareaUrls = () => {
    const urlArray = textareaContent.split('\n');
    const cleanedUrls = cleanUrls(urlArray);
    setUrls(cleanedUrls);
  };

  const toggleInputType = () => {
    setInputType(prevType => (prevType === 'text' ? 'file' : 'text'));
    setUrls([]);
    setTextareaContent('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_NETLIFY_FUNCTION_URL}/.netlify/functions/checkRedirects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
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
        <button onClick={toggleInputType}>
          {inputType === 'text' ? 'Switch to File Upload' : 'Switch to text Input'}
        </button>

        <form onSubmit={handleSubmit}>
          {inputType === 'text' ? (
            <>
              <textarea
                rows="10"
                value={textareaContent}
                onChange={handleTextareaChange}
                placeholder="Enter URLs, one per line"
              />
              <button type="button" onClick={processTextareaUrls}>Process URLs</button>
            </>
          ) : (
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          )}
          <button type="submit" disabled={urls.length === 0}>Check Redirects</button>
        </form>
        {error && <p className="error">{error}</p>}
        {results && results.map((result, index) => (
          <div key={index}>
            <h2>Results for {result.url}</h2>
            {result.error ? (
              <p className="error">Error: {result.error}</p>
            ) : (
              <>
                <h3>Redirects:</h3>
                <ul>
                  {result.redirects.map((redirect, i) => (
                    <li key={i}>
                      From: {redirect.from}, To: {redirect.to}, Status Code: {redirect.status_code}
                    </li>
                  ))}
                </ul>
                <h3>Final Result:</h3>
                <p>Final URL: {result.final_result.final_url}, Status Code: {result.final_result.status_code}</p>
              </>
            )}
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;