import json
from typing import Optional, List
import requests
from pydantic import BaseModel
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time
import os

MENS_YEAR_IDS = {
    "2025": "5208",
    "2024": "4643",
    "2023": "4054",
    "2022": "3482",
    "2021": "3359",
    "2020": "2761",
    "2019": "2277",
    "2018": "2036",
}

WOMENS_YEAR_IDS = {
    "2018": "2037",
    "2019": "2278",
    "2020": "2762",
    "2021": "3360",
    "2022": "3483",
    "2023": "4055",
    "2024": "4644",
    "2025": "5211",
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


def fetch_players_for_year(
    year: str, division: str = "mens", limit: int = 200
) -> List[RawPlayer]:
    year_ids = MENS_YEAR_IDS if division == "mens" else WOMENS_YEAR_IDS
    year_id = year_ids[year]
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
        description="Fetch college squash player data for specified years"
    )
    parser.add_argument(
        "years", nargs="*", help="The years to fetch data for (e.g. 2022 2023)"
    )
    parser.add_argument(
        "--division",
        choices=["mens", "womens", "both"],
        default="mens",
        help="Specify division (mens, womens, or both)",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Just write existing data files to players.json without fetching new data",
    )
    args = parser.parse_args()

    if args.write:
        combined_data = {"mens": [], "womens": []}
        data_dir = "data"

        if os.path.exists(data_dir):
            for filename in os.listdir(data_dir):
                if filename.endswith("_players.json"):
                    year = filename.split("_")[0]
                    division = "womens" if "womens" in filename else "mens"

                    with open(os.path.join(data_dir, filename), "r") as f:
                        data = json.load(f)
                        combined_data[division].append(data)

            output_dir = os.path.join("src", "data")
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, "players.json")

            with open(output_path, "w") as f:
                json.dump(combined_data, f, indent=2)

            print("Combined all existing player data into src/data/players.json")

    else:
        if not args.years:
            parser.error("Years are required unless using --write")

        divisions = ["mens", "womens"] if args.division == "both" else [args.division]

        combined_data = {"mens": [], "womens": []}

        # First load existing combined data if it exists
        output_dir = os.path.join("src", "data")
        output_path = os.path.join(output_dir, "players.json")
        if os.path.exists(output_path):
            with open(output_path, "r") as f:
                combined_data = json.load(f)
        else:
            combined_data = {"mens": [], "womens": []}

        for division in divisions:
            for year in args.years:
                try:
                    players = fetch_players_for_year(year, division)
                    player_data = [
                        raw_player_to_player_data(player) for player in players
                    ]
                    print(f"Fetched {len(player_data)} {division} players for {year}")
                    response = PlayerResponse(year=year, players=player_data)
                    output_file = f"data/{year}_{division}_players.json"
                    os.makedirs("data", exist_ok=True)
                    with open(output_file, "w") as f:
                        json.dump(response.dict(), f, indent=4)
                    print(f"Saved player data to {output_file}")

                    combined_data[division] = [
                        d for d in combined_data[division] if d["year"] != year
                    ]
                    combined_data[division].append(response.dict())

                except KeyError:
                    print(f"No data available for {division} division in {year}")

        output_dir = os.path.join("src", "data")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "players.json")

        with open(output_path, "w") as f:
            json.dump(combined_data, f, indent=2)

        print("Combined all player data into src/data/players.json")
