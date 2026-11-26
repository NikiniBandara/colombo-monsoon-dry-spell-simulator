# Rainfall data and provenance

The source is **ERA5 reanalysis daily precipitation**, served through the [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api). ERA5 is produced by the Copernicus Climate Change Service (C3S) at ECMWF. These are reanalysis **grid-cell estimates**, not observations from a rain gauge in central Colombo. The saved data covers **1991-01-01 through 2025-12-31** in daily local dates.

## Recorded source request and location

The recorded acquisition query requested **6.9355° N, 79.8487° E** near Colombo, dates **1991-01-01 to 2025-12-31**, `daily=precipitation_sum`, `timezone=Asia/Colombo`, and `models=era5`:

[`https://archive-api.open-meteo.com/v1/archive?latitude=6.9355&longitude=79.8487&start_date=1991-01-01&end_date=2025-12-31&daily=precipitation_sum&timezone=Asia%2FColombo&models=era5`](https://archive-api.open-meteo.com/v1/archive?latitude=6.9355&longitude=79.8487&start_date=1991-01-01&end_date=2025-12-31&daily=precipitation_sum&timezone=Asia%2FColombo&models=era5)

The repository's CSV metadata instead reports the returned cell at **7.0° N, 80.0° E**, elevation **4 m**, UTC offset **19,800 seconds** and timezone **Asia/Colombo**. This is a real requested-point versus returned-cell difference. The API selects a model grid cell, and its documentation lists ERA5 resolution as **0.25° (about 25 km)**. Consequently, “Colombo” describes the requested area, **not a precise Colombo station measurement**. The notebook and model were built from the returned grid cell; no data or model values are changed here.

The recorded request explains the intended source parameters, but the original **retrieval date and exact CSV-export action were not recorded**. A fresh API request could return revised data. The committed CSV is the data used for the saved analyses.

## Files and transformations

| File | Contents and origin |
|---|---|
| [`colombo_daily_rainfall_1991_2025.csv`](colombo_daily_rainfall_1991_2025.csv) | Source CSV. It starts with a metadata header and values, a blank line, then the actual `time,precipitation_sum (mm)` data header. Rainfall unit: **millimetres per day (mm)**. |
| [`colombo_rainfall_cleaned.csv`](colombo_rainfall_cleaned.csv) | Notebook-cleaned `date,rainfall_mm` daily table, sorted and checked for missing values, duplicate dates, gaps and invalid rainfall. |
| [`colombo_rainfall_features.csv`](colombo_rainfall_features.csv) | Daily table with year, month, day, day of year, wet/dry indicators, four-season label, consecutive dry-day count and spell identifier. Dry means rainfall **below 1 mm**. |
| [`colombo_dry_spells.csv`](colombo_dry_spells.csv) | One record per identified dry spell: start date, end date, duration in days and season label. |

The raw CSV is kept unchanged. The [notebook](../notebook/colombo-monsoon-dry-spell-simulator.ipynb) performs cleaning and feature construction; [`models/seasonal_markov_model.json`](../models/seasonal_markov_model.json) stores probabilities fitted on **1991–2018**, and [`results/`](../results/) contains saved experiments and evaluation for **2019–2025** where applicable.

## Licence, redistribution and required credits

The [Open-Meteo data licence](https://open-meteo.com/en/license) offers API data under **Creative Commons Attribution 4.0 International (CC BY 4.0)**. It permits copying, redistribution and adaptation when appropriate credit, a [licence link](https://creativecommons.org/licenses/by/4.0/), and an indication of changes are supplied. The [Copernicus product licence](https://cds.climate.copernicus.eu/licences/licence-to-use-copernicus-products) also permits redistribution and adaptation with clear C3S attribution and a responsibility notice. The dataset and derived CSVs can therefore be redistributed **with these credits and terms**; the project's [MIT code licence](../LICENSE) does not relicense them.

**Attribution for the source data:** Weather data by [Open-Meteo.com](https://open-meteo.com/) using [ERA5](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview) from the Copernicus Climate Change Service / ECMWF. Source API data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The cleaned, feature and spell files are modified versions made by this project's notebook.

**Copernicus notice:** Contains modified Copernicus Climate Change Service information. Neither the European Commission nor ECMWF is responsible for any use that may be made of the Copernicus information or data it contains.

The exact original download date remains unrecorded. This does not change the stated licence permissions, but it limits provenance precision and should be added if an authentic acquisition record is found.
