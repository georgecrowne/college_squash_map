import json
import glob
import os


def combine_player_data():
    # Get all player data JSON files
    json_files = glob.glob("*_player_data.json")
    all_years = []

    # Read and combine each file
    for file_path in json_files:
        with open(file_path, "r") as f:
            year_data = json.load(f)
            all_years.append(year_data)

    # Write combined data to players.json in src/data directory
    output_dir = os.path.join("src", "data")
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "players.json")
    with open(output_path, "w") as f:
        json.dump(all_years, f, indent=2)


if __name__ == "__main__":
    combine_player_data()
