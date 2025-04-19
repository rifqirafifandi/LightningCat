import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {loadStripe} from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from "react-bootstrap";
import { useUserData } from "../../../../contexts/userData";
import styles from "./TopUp.module.css";

const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

const options = {
  mode: 'payment',
  amount: 100,
  currency: 'sgd',
};

const stripeUnitsToDecimal = (amount) => {
  if (amount === null || amount === undefined) {
    return null;
  }
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number');
  }
  if (amount < 0) {
    throw new Error('Amount must be a positive number');
  }
  return (amount / 100).toFixed(2);
}

const PaymentForm = ({ amount }) => {  
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { createTransaction } = useUserData();
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (elements == null) {
      return;
    }

    // Trigger form validation and wallet collection
    const {error: submitError} = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret from your server endpoint
    const res = await fetch('/create-intent', {
      method: 'POST',
    });

    const {client_secret: clientSecret} = await res.json();

    const {error} = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: 'https://web.chucklenuts.party/account/wallet/topup/complete',
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  const handleClick = async () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      createTransaction(amount, 'deposit', null, null);
      navigate('/account/wallet/topup/complete', { state: { amount: stripeUnitsToDecimal(amount), from: location } });
    }
    , 3000);
  }

  return (
    <form className={styles.paymentForm} onSubmit={handleSubmit}>
      <PaymentElement />
      {/* <Button variant='primary' className={styles.stripePayButton} type="submit" disabled={!stripe || !elements}>Pay</Button> */}
      <Button 
        variant='primary' 
        className={styles.stripePayButton} 
        onClick={handleClick}
        disabled={!stripe || !elements || paymentLoading}
      >
        {
          paymentLoading 
          ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          : `Pay SGD ${stripeUnitsToDecimal(amount)}`
        }
      </Button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
}

const TopUp = () => {
  const [amount, setAmount] = useState(0);
  
  return (
    <>
      <NavLink className={styles.backNav} to="/account/wallet">← Back to my wallet</NavLink>
      <h1>Top-up with Stripe</h1>
      <h4>Choose amount to top-up</h4>
      <ul className={styles.topUpList}>
        <li className={`${styles.topUpListItem} ${amount === 1000 ? styles.selected : ''}`}><button onClick={() => setAmount(1000)}>SGD 10.00</button></li>
        <li className={`${styles.topUpListItem} ${amount === 5000 ? styles.selected : ''}`}><button onClick={() => setAmount(5000)}>SGD 50.00</button></li>
        <li className={`${styles.topUpListItem} ${amount === 10000 ? styles.selected : ''}`}><button onClick={() => setAmount(10000)}>SGD 100.00</button></li>
      </ul>
        { amount
          ? <>
              <h4>Selected amount: SGD {stripeUnitsToDecimal(amount)}</h4>
              <p>Clicking on 'Pay' will bring you to Stripe's payment verification page.</p>
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm amount={amount} />
              </Elements>
            </>
          : ''
        }
    </>
  )
}

export default TopUp