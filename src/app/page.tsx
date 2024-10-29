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

const yearOptions = [
  { value: "2019", text: "2018-2019" },
  { value: "2020", text: "2019-2020" },
  { value: "2021", text: "2020-2021" },
  { value: "2022", text: "2021-2022" },
  { value: "2023", text: "2022-2023" },
  { value: "2024", text: "2023-2024" },
];

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(yearOptions[0].value);
  const [selectedPlayer, setSelectedPlayer] = useState<
    (typeof players.players)[number] | null
  >(null);

  const playersData = useMemo(() => {
    return players.year === selectedYear ? players.players : [];
  }, [selectedYear]);

  const handlePlayerClick = (player: (typeof players.players)[number]) => {
    setSelectedPlayer(player);
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
              <div className="grid grid-cols-3">
                {Object.entries(
                  playersData.reduce((acc, player) => {
                    if (!acc[player.team]) {
                      acc[player.team] = [];
                    }
                    acc[player.team].push(player);
                    return acc;
                  }, {} as Record<string, (typeof playersData)[number][]>)
                ).map(([team, teamPlayers]) => (
                  <div key={team} className="p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{team}</h3>
                    <div className="space-y-2">
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
                            {player.city}, {player.country}
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
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Position</div>
                  <div>{selectedPlayer.team_position}</div>
                </div>
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
