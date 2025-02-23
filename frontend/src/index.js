import React from 'react';
import { createRoot } from 'react-dom/client'; // Correct import for React 18
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Ensure your URI includes the protocol (http:// or https://)
const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql', // Corrected URI
  cache: new InMemoryCache(),
});

// Access the root DOM element more safely
const container = document.getElementById('root');
const root = container ? createRoot(container) : null;

// Use the root.render method for React 18, wrapping App with ApolloProvider
root?.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

// Call reportWebVitals if needed
reportWebVitals();
