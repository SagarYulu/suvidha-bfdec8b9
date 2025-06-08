
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
  const realtime = useRealtime();
  
  return (
    <RealTimeContext.Provider value={realtime}>
      {children}
    </RealTimeContext.Provider>
  );
};
