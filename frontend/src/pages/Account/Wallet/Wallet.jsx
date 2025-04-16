import React from 'react';
import { useUserData } from '../../../contexts/userData';
import EmptyStateWalletImage from '../../../assets/images/empty-state-wallet.svg';
import styles from './Wallet.module.css';

const Wallet = () => {
  const { wallet, fetchWallet, transactions, fetchTransactions } = useUserData();

  React.useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  return (
    <>
      <h1>My Wallet</h1>
      {
        parseFloat(wallet?.balance) > 0
        ? <p>Your balance is ${parseFloat(wallet?.balance).toFixed(2)}</p>
        : <div className={styles.emptyStateContainer}>
            <img src={EmptyStateWalletImage} alt="No listings" className={styles.emptyStateImage} />
            <p>You have no credits in your wallet.</p>
            <button href="#" className={styles.stripeButton}><span>Top-up with</span></button>
          </div>
      }
    </>
  );
}

export default Wallet;
