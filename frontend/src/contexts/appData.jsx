import React, { useState, useContext, createContext } from "react";
const AppDataContext = createContext();

const AppDataProvider = ({ children }) => {
  const [facilities, setFacilities] = useState([]);
  return (
    <AppDataContext.Provider
      value={{
        facilities,
        setFacilities,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
  
export default AppDataProvider;

export const useAppData = () => {
  return useContext(AppDataContext);
};
  