import React, { useState, useContext, createContext } from "react";
import { useAuth } from "./auth";
const UserDataContext = createContext();

const UserDataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

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
        setListings(json);
      }
    } catch (error) {
      console.error("Fetch user listings failed:", error);
    }
  }, [isAuthenticated, user]);

  return (
    <UserDataContext.Provider
      value={{
        listings,
        setListings,
        fetchUserListings,
        bookings,
        setBookings,
        fetchUserBookings,
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
