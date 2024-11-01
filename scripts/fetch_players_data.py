import json
from typing import Optional, List
import requests
from pydantic import BaseModel
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

YEAR_IDS = {
    "2025": "5208",
    "2024": "4643",
    "2023": "4054",
    "2022": "3482",
    "2021": "3359",
    "2020": "2761",
    "2019": "2277",
    "2018": "2036",
}


class RawPlayer(BaseModel):
    player: str
    teamname: str
    city: str
    country: str
    wins: str
    losses: str
    TeamPosition: str
    Rating: str


class Player(BaseModel):
    name: str
    team: str
    city: str
    country: str
    display_location: str
    record: str
    team_position: Optional[int]
    rating: float
    lat: float
    lng: float


class PlayerResponse(BaseModel):
    year: str
    players: List[Player]


def fetch_players_for_team_year(team_id: str) -> List[RawPlayer]:
    response = requests.get(
        f"https://api.ussquash.com/resources/teams/{team_id}/players"
    )
    return [RawPlayer(**player) for player in response.json()]


def fetch_teams_for_year(year_id: str) -> List[dict]:
    response = requests.get(
        f"https://api.ussquash.com/resources/divisions/standings/{year_id}"
    )
    return response.json()


def fetch_players_for_year(year: str, limit: int = 100) -> List[RawPlayer]:
    year_id = YEAR_IDS[year]
    teams = fetch_teams_for_year(year_id)
    players = []
    count = 0
    for team in teams:
        team_players = fetch_players_for_team_year(team["teamid"])
        players.extend(team_players)
        count += len(team_players)
        if count >= limit:
            break
    return players


def raw_player_to_player_data(raw_player: RawPlayer) -> Player:
    geolocator = Nominatim(user_agent="college_squash_app")

    location = (
        f"{raw_player.city}, {raw_player.country}"
        if raw_player.city
        else raw_player.country
    )

    coords = None
    max_retries = 3
    wait_time = 1

    for attempt in range(max_retries):
        try:
            if location:
                print(
                    f"Attempting to geocode location: {location} (attempt {attempt + 1}/{max_retries})"
                )
                location_data = geolocator.geocode(location)
                if location_data:
                    coords = (location_data.latitude, location_data.longitude)
                    print(f"Successfully geocoded {location} to coordinates {coords}")
                    break
                else:
                    print(
                        f"Could not find coordinates for {location}, trying just country: {raw_player.country}"
                    )
                    location_data = geolocator.geocode(raw_player.country)
                    if location_data:
                        coords = (location_data.latitude, location_data.longitude)
                        print(
                            f"Successfully geocoded {raw_player.country} to coordinates {coords}"
                        )
                        break
                    else:
                        print(
                            f"Could not find coordinates for country: {raw_player.country}"
                        )
                        break
            else:
                break
        except GeocoderTimedOut:
            print(f"Geocoding timed out on attempt {attempt + 1}/{max_retries}")
            if attempt < max_retries - 1:
                print(f"Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
                wait_time *= 2
            else:
                print("Max retries reached, continuing with coords=None")
        except Exception as e:
            print(f"Error geocoding location {location}: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
                wait_time *= 2
            else:
                print("Max retries reached, continuing with coords=None")

    return Player(
        name=raw_player.player.strip(),
        team=raw_player.teamname.replace(" University", "").replace(", of", ""),
        city=raw_player.city.strip().title() if raw_player.city else "",
        country=raw_player.country.strip().title() if raw_player.country else "",
        display_location=f"{raw_player.city.strip().title()}, {raw_player.country.strip().title()}"
        if raw_player.city and raw_player.city.strip()
        else raw_player.country.strip().title(),
        record=f"{raw_player.wins}-{raw_player.losses}",
        team_position=int(raw_player.TeamPosition)
        if raw_player.TeamPosition != "0"
        else None,
        rating=float(raw_player.Rating),
        lat=coords[0] if coords else 0,
        lng=coords[1] if coords else 0,
    )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Fetch college squash player data for a given year"
    )
    parser.add_argument("year", help="The year to fetch data for (e.g. 2022)")
    args = parser.parse_args()

    players = fetch_players_for_year(args.year)
    player_data = [raw_player_to_player_data(player) for player in players]
    print(f"Fetched {len(player_data)} players for {args.year}")

    response = PlayerResponse(year=args.year, players=player_data)
    output_file = f"{args.year}_player_data.json"
    with open(output_file, "w") as f:
        json.dump(response.dict(), f, indent=4)
    print(f"Saved player data to {output_file}")
