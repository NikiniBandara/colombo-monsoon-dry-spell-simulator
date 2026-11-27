# References

The first five entries are a scientific foundation for rainfall occurrence modelling, ERA5 input data, forecast verification and the Wilson sampling interval. The later entries document the actual data product, licence and Sri Lankan seasonal calendar. Bibliographic details below were checked against the linked publisher or provider pages; the bibliography does not imply access to any full paper hidden behind a paywall.

1. C. W. Richardson, “Stochastic simulation of daily precipitation, temperature, and solar radiation,” *Water Resources Research*, vol. 17, no. 1, pp. 182–190, 1981. [doi:10.1029/WR017i001p00182](https://doi.org/10.1029/WR017i001p00182). Classic stochastic rainfall-generation paper using Markov-chain precipitation occurrence. This project's binary occurrence model does **not** implement Richardson's precipitation-amount component.

2. H. Hersbach *et al.*, “The ERA5 global reanalysis,” *Quarterly Journal of the Royal Meteorological Society*, vol. 146, no. 730, pp. 1999–2049, 2020. [doi:10.1002/qj.3803](https://doi.org/10.1002/qj.3803). Scientific description of the reanalysis behind this project's rainfall series.

3. G. W. Brier, “Verification of forecasts expressed in terms of probability,” *Monthly Weather Review*, vol. 78, no. 1, pp. 1–3, 1950. [Publisher DOI record](https://doi.org/10.1175/1520-0493%281950%29078%3C0001%3AVOFEIT%3E2.0.CO%3B2) (doi:10.1175/1520-0493(1950)078&lt;0001:VOFEIT&gt;2.0.CO;2). Source of the probability-score approach used for held-out evaluation.

4. E. B. Wilson, “Probable inference, the law of succession, and statistical inference,” *Journal of the American Statistical Association*, vol. 22, no. 158, pp. 209–212, 1927. [doi:10.1080/01621459.1927.10502953](https://doi.org/10.1080/01621459.1927.10502953). Original Wilson binomial-interval paper relevant to the browser's Monte Carlo sampling interval.

5. D. S. Wilks, *Statistical Methods in the Atmospheric Sciences*, 4th ed. Elsevier, 2019. [Publisher record](https://shop.elsevier.com/books/statistical-methods-in-the-atmospheric-sciences/wilks/978-0-12-815823-4). Reference text on atmospheric statistics, stochastic modelling and forecast verification.

6. Open-Meteo, [“Historical Weather API”](https://open-meteo.com/en/docs/historical-weather-api). Provider documentation for the ERA5 model option, grid selection, 0.25° ERA5 resolution, daily `precipitation_sum` and API request parameters. The recorded project request is in [data/README.md](data/README.md).

7. Open-Meteo, [“Licence”](https://open-meteo.com/en/license). Provider's **CC BY 4.0** permission and attribution requirements for API data.

8. Copernicus Climate Change Service, [“ERA5 hourly data on single levels from 1940 to present”](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview), [doi:10.24381/cds.adbb2d47](https://doi.org/10.24381/cds.adbb2d47). Original product record for the ERA5 reanalysis underlying the Open-Meteo request; the project's CSV was obtained through Open-Meteo, not downloaded directly from this product page.

9. European Union / ECMWF, [“Licence to use Copernicus Products”](https://cds.climate.copernicus.eu/licences/licence-to-use-copernicus-products). Redistribution and attribution conditions for Copernicus information.

10. A. R. Warnasooriya, A. C. M. Rodrigo, and K. H. M. S. Premalal, [“Case Study of Flash Flood Event on 14th November 2014 in Colombo due to Short Period High Intense Rainfall”](https://www.meteo.gov.lk/images/case-study-flash-flood-in-Colombo.pdf), Department of Meteorology, Sri Lanka, publication year not stated in the accessible PDF. Its introduction names the four monsoon/inter-monsoon month ranges used by the model. **Manual verification still needed:** the original publication year and formal venue, if a full report citation is required.

The source CSV's **original retrieval date is not recorded**. See [data/README.md](data/README.md) for that remaining provenance detail and for the requested-coordinate versus returned-grid-cell difference.
