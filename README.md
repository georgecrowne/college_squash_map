# College Squash Map

## Usage

Basic usage:
```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Generating data


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

Fetch multiple years at once for men and women:
```bash
python scripts/fetch_players_data.py 2023 2024 2025 --division both
```

### Output

The script will:

1. Create individual JSON files for each year in the format: `{year}_{division}_player_data.json`

2. Combine all player data into a single file at `src/data/players.json`

### Available Years
- Men's: 2018-2025
- Women's: 2018-2025
