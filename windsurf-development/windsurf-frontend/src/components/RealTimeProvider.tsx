
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';

interface RealTimeContextType {
  isConnected: boolean;
  connectionStatus: string;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  subscribeToIssueUpdates: (callback: (data: any) => void) => () => void;
  subscribeToComments: (callback: (data: any) => void) => () => void;
  subscribeToAssignments: (callback: (data: any) => void) => () => void;
  subscribeToStatusChanges: (callback: (data: any) => void) => () => void;
  reconnect: () => void;
}

const RealTimeContext = createContext<RealTimeContextType | null>(null);

export const useRealTimeContext = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTimeContext must be used within RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isConnected,
    connectionStatus,
    subscribe,
    subscribeToIssueUpdates,
    subscribeToComments,
    subscribeToAssignments,
    subscribeToStatusChanges,
    connect
  } = useRealtime({
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  });

  const contextValue: RealTimeContextType = {
    isConnected,
    connectionStatus,
    subscribe,
    subscribeToIssueUpdates,
    subscribeToComments,
    subscribeToAssignments,
    subscribeToStatusChanges,
    reconnect: connect
  };

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
    </RealTimeContext.Provider>
  );
};
