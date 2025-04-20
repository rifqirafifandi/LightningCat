import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { useUserData } from '../../../contexts/userData';
import EmptyStateWalletImage from '../../../assets/images/empty-state-wallet.svg';
import EmptyStateNoData from '../../../assets/images/empty-state-no-data.svg';
import styles from './Wallet.module.css';


const Wallet = () => {
  const navigate = useNavigate();
  const { wallet, fetchWallet, transactions, fetchTransactions } = useUserData();

  React.useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const handleTopUpButtonClick = () => {
    navigate('topup');
  }

  return (
    <>
      <div className={styles.headerContainer}>
        <h1>My Wallet</h1>
        {
          parseFloat(wallet?.balance) > 0
          ? <button onClick={handleTopUpButtonClick} className={styles.stripeButton}><span>Top-up with</span></button>
          : ''
        }
      </div>
      <h4>Credits</h4>
      {
        parseFloat(wallet?.balance) > 0
        ? <>
            <p>Your current wallet balance is ${parseFloat(wallet?.balance).toFixed(2)}.</p>
          </>
        : <div className={styles.emptyStateContainer}>
            <img src={EmptyStateWalletImage} alt="No listings" className={styles.emptyStateImage} />
            <p>You have no credits in your wallet.</p>
            <button onClick={handleTopUpButtonClick} className={styles.stripeButton}><span>Top-up with</span></button>
          </div>
      }
      <h4>Transaction history</h4>
      {
        transactions.length
        ? <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount (SGD)</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {
                  transactions.map((transaction) => (
                    <tr key={ transaction.id }>
                      <td>{ transaction.id }</td>
                      <td>{parseFloat(transaction.amount).toFixed(2)}</td>
                      <td>{ transaction.transaction_type }</td>
                      <td>{ transaction.status }</td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </div>
        : <ul className={styles.emptyStateContainer}>
            <img src={EmptyStateNoData} alt="No transactions" className={styles.emptyStateImage} />
            <p>You have no transactions.</p>
          </ul>
      }
    </>
  );
}

export default Wallet;
