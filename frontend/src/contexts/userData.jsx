import React, { useState, useContext, createContext } from "react";
import { useNotification } from "./notification";
import { useAuth } from "./auth";
const UserDataContext = createContext();

const UserDataProvider = ({ children }) => {
  const { addNotification, removeNotification } = useNotification();
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState({});
  const [transactions, setTransactions] = useState([]);

  const fetchUserListings = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const resp = await fetch(`https://api.chucklenuts.party/listings/${user.id}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (resp.status > 204) {
        throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      }
      if (resp.status === 200) {
        const json = await resp.json();
        setListings(json);
      }
    } catch (error) {
      console.error("Fetch user listings failed:", error);
    }
  }, [isAuthenticated, user]);

  const fetchUserBookings = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const resp = await fetch(`https://api.chucklenuts.party/bookings/${user.id}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (resp.status > 204) {
        throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      }
      if (resp.status === 200) {
        const json = await resp.json();
        setBookings(json);
      }
    } catch (error) {
      console.error("Fetch user listings failed:", error);
    }
  }, [isAuthenticated, user]);

  const fetchWallet = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const resp = await fetch(`https://api.chucklenuts.party/wallet`, {
        method: 'GET',
        credentials: 'include',
      })
      if (resp.status > 204) {
        throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      }
      if (resp.status === 200) {
        const json = await resp.json();
        setWallet(json);
      }
    } catch (error) {
      console.error("Fetch user listings failed:", error);
    }
  }, [isAuthenticated, user]);

  const fetchTransactions = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const resp = await fetch(`https://api.chucklenuts.party/transactions`, {
        method: 'GET',
        credentials: 'include',
      })
      if (resp.status > 204) {
        throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      }
      if (resp.status === 200) {
        const json = await resp.json();
        setTransactions(json);
      }
    } catch (error) {
      console.error("Fetch user listings failed:", error);
    }
  }, [isAuthenticated, user]);

  const createListing = React.useCallback(async (formData) => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const response = await fetch('https://api.chucklenuts.party/listing', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status > 204) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (response.status === 201 && data) {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Listing posted successfully.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "success",
          show: true,
        })
        setListings((prevListings) => [...prevListings, data]);
      } else {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Error posting listing.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "danger",
          show: true,
        })
      }
    } catch (error) {
      console.error("Error posting listing:", error);
      addNotification({
        id: Date.now(),
        title: "LightningCat",
        message: "Error posting listing.",
        time: new Date().toLocaleTimeString(),
        removeNotification: removeNotification,
        type: "danger",
        show: true,
      })
    }
  }, [addNotification, isAuthenticated, removeNotification, user]);

  const createBooking = React.useCallback(async (listingId) => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const response = await fetch(`https://api.chucklenuts.party/booking`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ listing_id: listingId }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json();
      if (response.status === 201 && data) {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Booking made successfully.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "success",
          show: true,
        })
        setBookings((prevBookings) => [...prevBookings, data]);
      } else {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Error making booking. Please try again later.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "danger",
          show: true,
        })
      }
    } catch (error) {
      console.error("Error making booking:", error);
      addNotification({
        id: Date.now(),
        title: "LightningCat",
        message: "Error making booking. Please try again later.",
        time: new Date().toLocaleTimeString(),
        removeNotification: removeNotification,
        type: "danger",
        show: true,
      })
    }
  }
  , [addNotification, isAuthenticated, removeNotification, user]);

  const createTransaction = React.useCallback(async (amount, transactionType, bookingId, listingId) => {
    if (!isAuthenticated || !user) {
      console.error("User is not authenticated");
      return;
    }

    const payload = {
      amount,
      transaction_type: transactionType,
    }

    if (transactionType === "booking") {
      payload.booking_id = bookingId;
    } else if (transactionType === "listing") {
      payload.listing_id = listingId;
    }

    try {
      const response = await fetch(`https://api.chucklenuts.party/transaction`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json();
      if (response.status === 201 && data) {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Transaction made successfully.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "success",
          show: true,
        })
        setTransactions((prevTransactions) => [...prevTransactions, data]);
      } else {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Error making transaction. Please try again later.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "danger",
          show: true,
        })
      }
    } catch (error) {
      console.error("Error making transaction:", error);
      addNotification({
        id: Date.now(),
        title: "LightningCat",
        message: "Error making transaction. Please try again later.",
        time: new Date().toLocaleTimeString(),
        removeNotification: removeNotification,
        type: "danger",
        show: true,
      })
    }
  }, [addNotification, isAuthenticated, removeNotification, user]);

  return (
    <UserDataContext.Provider
      value={{
        listings,
        setListings,
        fetchUserListings,
        createListing,
        bookings,
        setBookings,
        fetchUserBookings,
        createBooking,
        wallet,
        fetchWallet,
        transactions,
        setTransactions,
        fetchTransactions,
        createTransaction
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataProvider;

export const useUserData = () => {
  return useContext(UserDataContext);
};
