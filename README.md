# College Squash Data Fetcher

This script fetches player data from the US Squash API for college squash teams.

## Usage

Basic usage:```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Examples

Fetch men's data for a single year:
```bash
python scripts/fetch_players_data.py 2025 --division mens
```

Fetch women's data for a single year:
```bash
python scripts/fetch_players_data.py 2025 --division womens
```

Fetch multiple years at once:
```bash
python scripts/fetch_players_data.py 2023 2024 2025 --division mens
```

### Output

The script will:
1. Create individual JSON files for each year in the format: `{year}_{division}_player_data.json`
2. Combine all player data into a single file at `src/data/players.json`

### Available Years
- Men's: 2018-2025
- Women's: 2025 (more years to be added)
