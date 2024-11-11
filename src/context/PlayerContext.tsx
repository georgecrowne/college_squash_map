"use client";

import { Player } from "@/app/page";
import { createContext, useContext, useState, ReactNode } from "react";

interface PlayerContextType {
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <PlayerContext.Provider value={{ selectedPlayer, setSelectedPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
