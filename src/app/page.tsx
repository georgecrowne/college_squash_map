"use client";

import CollegeSquashMap from "@/components/CollegeSquashMap";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import players from "@/data/players.json";
import { useState, useMemo } from "react";

interface Player {
  name: string;
  team: string;
  city: string;
  country: string;
  display_location: string;
  record: string;
  team_position: number | null;
  rating: number;
  lng: number;
  lat: number;
}

const yearOptions = [
  { value: "2018", text: "2017-2018" },
  { value: "2019", text: "2018-2019" },
  { value: "2020", text: "2019-2020" },
  { value: "2021", text: "2020-2021" },
  { value: "2022", text: "2021-2022" },
  { value: "2023", text: "2022-2023" },
  { value: "2024", text: "2023-2024" },
  { value: "2025", text: "2024-2025" },
];

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(yearOptions[0].value);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const playersData = useMemo(() => {
    const yearData = players.find((year) => year.year === selectedYear);
    const data = yearData ? yearData.players : [];
    return data.map((player) => ({
      ...player,
    }));
  }, [selectedYear]);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer({
      ...player,
    });
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex gap-2 h-full">
        <div className="w-1/3 h-full">
          <>
            <div className="rounded-lg bg-white mb-2">
              <label htmlFor="year">Year:</label>
              <Select
                value={selectedYear}
                onValueChange={(year) => {
                  setSelectedYear(year);
                  setSelectedPlayer(null);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {yearOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.text}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {playersData.length === 0 ? (
              <div className="text-center p-4">
                No players found for the selected year.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(
                  playersData.reduce((acc, player) => {
                    if (!acc[player.team]) {
                      acc[player.team] = [];
                    }
                    acc[player.team].push(player);
                    return acc;
                  }, {} as Record<string, Player[]>)
                ).map(([team, teamPlayers]) => (
                  <div key={team} className="p-4 rounded-lg bg-white shadow-md">
                    <h3 className="font-semibold text-lg mb-2">{team}</h3>
                    <div className="space-y-2 h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                      {teamPlayers.map((player) => (
                        <div
                          key={player.name}
                          className={`text-sm cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors ${
                            selectedPlayer?.name === player.name
                              ? "bg-gray-200"
                              : ""
                          }`}
                          onClick={() => handlePlayerClick(player)}
                        >
                          {player.name}
                          <div className="text-gray-500 text-xs">
                            {player.display_location}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        </div>
        <div className="w-2/3 flex flex-col h-full">
          <div className={selectedPlayer ? "h-2/3" : "h-full"}>
            <CollegeSquashMap
              currentPlayer={selectedPlayer}
              players={playersData}
            />
          </div>
          {selectedPlayer && (
            <div className="h-1/3 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
                  <div className="text-lg font-semibold text-gray-600">
                    {selectedPlayer.team}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Location</div>
                  <div>
                    {selectedPlayer.city}, {selectedPlayer.country}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Rating</div>
                  <div>{selectedPlayer.rating}</div>
                </div>
                {selectedPlayer.team_position && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Position</div>
                    <div>{selectedPlayer.team_position}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Season Record</div>
                  <div>{selectedPlayer.record}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
