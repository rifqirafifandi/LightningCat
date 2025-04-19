import React from 'react';
import { createRoot } from 'react-dom/client'; // Correct import for React 18
import { RouterProvider } from 'react-router-dom';
import AuthProvider from './contexts/auth';
import AppDataProvider from './contexts/appData';
import NotificationProvider from './contexts/notification';
import UserDataProvider from './contexts/userData';
import router from './routes';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import './index.css';

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
      <AuthProvider>
        <AppDataProvider>
          <NotificationProvider>
            <UserDataProvider>
              <RouterProvider router={router} />
            </UserDataProvider>
          </NotificationProvider>
        </AppDataProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);

// Call reportWebVitals if needed
reportWebVitals();
