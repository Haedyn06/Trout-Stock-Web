import argparse
import re
import json
import time
import camelot

from datetime import datetime
from geopy.geocoders import Nominatim
from geopy.distance import geodesic

DEFAULT_PDF_PATH = "StockReport.pdf"
DEFAULT_OUTPUT_PATH = "TroutData.json"

CALGARY = (51.0447, -114.0719)
EDMONTON = (53.5461, -113.4938)

geolocator = Nominatim(
    user_agent="alberta_fish_stocking_mapper"
)

SPECIES_MAP = {
    "BKTR": "brookTrout",
    "BNTR": "brownTrout",
    "TGTR": "tigerTrout",
    "RNTR": "rainbowTrout",
    "WSCT": "cutthroatTrout",
    "CTTR": "cutthroatTrout",
    "WALL": "walleye"
}

ALL_FISH_TYPES = [
    "brookTrout",
    "brownTrout",
    "tigerTrout",
    "rainbowTrout",
    "cutthroatTrout",
    "walleye"
]

ATS_REGEX = re.compile(
    r"^[NESW]{1,2}\d{1,2}-\d{1,3}-\d{1,2}-W\d$"
)

DATE_REGEX = re.compile(
    r"^\d{1,2}-[A-Za-z]{3}-\d{2}$"
)


def fix_name(name):
    name = re.sub(r"\s+", " ", name.strip())

    if "(" in name and not name.endswith(")"):
        name = f"{name})"

    return name


def make_id(name):
    name = fix_name(name)

    return re.sub(
        r"_+",
        "_",
        (
            name.lower()
            .replace("&", "and")
            .replace("'", "")
            .replace("(", "")
            .replace(")", "")
            .replace("/", "_")
            .replace("-", "_")
            .replace(".", "")
            .replace(" ", "_")
        )
    ).strip("_")


def parse_date(date_str):
    return datetime.strptime(
        date_str,
        "%d-%b-%y"
    ).strftime("%Y-%m-%d")


def empty_fish_types():
    return {
        fish: {
            "population": 0,
            "avgLength": 0,
            "lastPopulatedDate": ""
        }
        for fish in ALL_FISH_TYPES
    }


def weighted_avg(entries):
    total_pop = sum(
        entry["population"]
        for entry in entries
    )

    if total_pop == 0:
        return 0

    return round(
        sum(
            entry["avgLength"] *
            entry["population"]
            for entry in entries
        ) / total_pop,
        2
    )


def geocode_waterbody(name):
    queries = [
        f"{name}, Alberta, Canada",
        f"{name} Lake, Alberta, Canada",
        f"{name} Reservoir, Alberta, Canada",
        f"{name} Pond, Alberta, Canada"
    ]

    for query in queries:
        try:
            result = geolocator.geocode(
                query,
                timeout=10
            )

            if result:
                return (
                    result.latitude,
                    result.longitude
                )

        except Exception:
            pass

    return (0, 0)


def is_valid_row(row):
    if len(row) < 8:
        return False

    ats = row[1].strip()
    species = row[2].strip()
    stock_date = row[-1].strip()

    return (
        ATS_REGEX.match(ats)
        and species in SPECIES_MAP
        and DATE_REGEX.match(stock_date)
    )


def clean_row(row):
    return [
        str(cell).replace("\n", " ").strip()
        for cell in row
    ]


parser = argparse.ArgumentParser(
    description="Extract Alberta fish stocking data from PDF tables."
)
parser.add_argument(
    "pdf",
    nargs="?",
    default=DEFAULT_PDF_PATH,
    help="Path to the stocking report PDF",
)
parser.add_argument(
    "-o",
    "--output",
    default=DEFAULT_OUTPUT_PATH,
    help="Output JSON path",
)
parser.add_argument(
    "--skip-geocode",
    action="store_true",
    help="Skip Nominatim geocoding (use enrich-locations.mjs instead)",
)
args = parser.parse_args()

print(f"Reading PDF: {args.pdf}")

tables = camelot.read_pdf(
    args.pdf,
    pages="all",
    flavor="stream"
)

waterbodies = {}
seen_rows = set()

for table in tables:

    df = table.df

    for _, row in df.iterrows():

        row = clean_row(
            row.tolist()
        )

        if not is_valid_row(row):
            continue

        try:
            name = fix_name(row[0])
            ats = row[1]
            species_code = row[2]

            avg_length = float(row[-3])

            population = int(
                row[-2].replace(",", "")
            )

            stock_date = parse_date(
                row[-1]
            )

        except Exception:
            continue

        fish_key = SPECIES_MAP[
            species_code
        ]

        row_key = (
            name,
            ats,
            species_code,
            population,
            stock_date,
        )
        if row_key in seen_rows:
            continue
        seen_rows.add(row_key)

        water_id = make_id(name)

        if water_id not in waterbodies:

            waterbodies[water_id] = {
                "id": water_id,
                "waterBodyName": name,
                "avgLength": 0,
                "latestStockDate": "",
                "population": 0,
                "location": {
                    "name": ats,
                    "latitude": 0,
                    "longitude": 0,
                    "cityRange": {
                        "calgaryKMRange": 0,
                        "edmontonKMRange": 0
                    }
                },
                "fishTypes": empty_fish_types(),
                "logs": [],
                "_avgEntries": []
            }

        wb = waterbodies[water_id]

        wb["population"] += population

        wb["latestStockDate"] = max(
            wb["latestStockDate"],
            stock_date
        )

        wb["_avgEntries"].append(
            {
                "avgLength": avg_length,
                "population": population
            }
        )

        fish = wb["fishTypes"][
            fish_key
        ]

        old_pop = fish["population"]

        fish["population"] += population

        if fish["population"] > 0:

            fish["avgLength"] = round(
                (
                    (
                        fish["avgLength"]
                        * old_pop
                    )
                    +
                    (
                        avg_length
                        * population
                    )
                )
                /
                fish["population"],
                2
            )

        fish[
            "lastPopulatedDate"
        ] = max(
            fish[
                "lastPopulatedDate"
            ],
            stock_date
        )

        wb["logs"].append(
            {
                "stockDate": stock_date,
                "typeOfFish": fish_key,
                "amountPopulated": population
            }
        )

print(
    f"Parsed {len(waterbodies)} waterbodies."
)

if args.skip_geocode:
    print("Skipping geocoding.")
else:
    print("Geocoding...")

    for i, wb in enumerate(
        waterbodies.values(),
        start=1
    ):

        print(
            f"[{i}/{len(waterbodies)}] "
            f"{wb['waterBodyName']}"
        )

        lat, lon = geocode_waterbody(
            wb["waterBodyName"]
        )

        wb["location"][
            "latitude"
        ] = lat

        wb["location"][
            "longitude"
        ] = lon

        if lat != 0 and lon != 0:

            wb["location"][
                "cityRange"
            ][
                "calgaryKMRange"
            ] = round(
                geodesic(
                    CALGARY,
                    (lat, lon)
                ).km
            )

            wb["location"][
                "cityRange"
            ][
                "edmontonKMRange"
            ] = round(
                geodesic(
                    EDMONTON,
                    (lat, lon)
                ).km
            )

        time.sleep(1)

result = []

for wb in waterbodies.values():

    wb["avgLength"] = weighted_avg(
        wb["_avgEntries"]
    )

    del wb["_avgEntries"]

    result.append(wb)

result.sort(
    key=lambda x:
    x["waterBodyName"]
)

with open(
    args.output,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        result,
        file,
        indent=2
    )

print()
print(
    f"Saved {len(result)} lakes to:"
)
print(args.output)