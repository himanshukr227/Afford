import React, { createContext, useState, useContext } from "react";

const LoggingContext = createContext();

export const LoggingProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const logEvent = (type, message, meta = {}) => {
    setLogs(prev => [
      ...prev,
      { type, message, meta, timestamp: Date.now() }
    ]);
  };
  return (
    <LoggingContext.Provider value={{ logEvent, logs }}>
      {children}
    </LoggingContext.Provider>
  );
};

export const useLogger = () => useContext(LoggingContext);
