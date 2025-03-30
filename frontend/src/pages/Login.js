import React from 'react';
import styles from './Login.module.css';

const Login = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login to LightningCat</h2>
        <div class="d-flex flex-column align-items-flex-start gap-2">
          <a role="button" className={styles.loginButton} href="https://api.chucklenuts.party/auth/google/login">
            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Logo" />
            Login with Google
          </a>
          <a role="button" className={styles.loginButton} href="https://api.chucklenuts.party/auth/cognito/login">
            <img src="https://img.icons8.com/color/16/000000/amazon.png" alt="Cognito Logo" />
            Login with Cognito
          </a>
        </div>
        <div className={styles.signUpDivider}>
          <hr />
          <span>or</span>
        </div>
        <div class="d-flex flex-row justify-content-center align-items-center">
          <a role="button" className={styles.signUpLink} href="https://ap-southeast-1gizy1x2zx.auth.ap-southeast-1.amazoncognito.com/signup?client_id=3s5teo690r892rfp9pg22q77ob&nonce=e1TvE2slnHMh3rkUT0XN7A&redirect_uri=https%3A%2F%2Fapi.chucklenuts.party%2Fauth%2Fcognito%2Fcallback&response_type=code&scope=openid+email+profile&state=lrSV2Z0CR8GTSPvZFybn3Q">
            Create an AWS Cognito Account
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;