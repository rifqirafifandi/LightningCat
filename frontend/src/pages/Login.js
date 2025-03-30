import React from 'react';
import styles from './Login.module.css';

const Login = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        <div class="d-flex flex-column align-items-flex-start gap-2">
          <button className={styles.loginButton}>
            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Logo" />
            Login with Google
          </button>
          <button className={styles.loginButton}>
            <img src="https://img.icons8.com/color/16/000000/amazon.png" alt="Cognito Logo" />
            Login with Cognito
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;