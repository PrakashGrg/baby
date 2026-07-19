import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'active_room_id';
const DEFAULT_ROOM = 'room1';

interface RoomContextType {
  roomId: string;
  setRoomId: (id: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomIdState] = useState<string>(DEFAULT_ROOM);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setRoomIdState(stored);
    });
  }, []);

  function setRoomId(id: string) {
    setRoomIdState(id);
    AsyncStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}