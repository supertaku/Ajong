# Third-party notices

No source code or media from the following research repositories is copied into this concept. These notices record the workflows reviewed and the license obligations that apply if their code or assets are incorporated later.

## scroll-world

- Repository: <https://github.com/oso95/scroll-world>
- License: MIT
- Current use: planning and prompting workflow only; no renderer code or generated clips incorporated
- Future requirement: retain the MIT copyright and permission notice with any copied or distributed code

## LingBot-Map

- Repository: <https://github.com/robbyant/lingbot-map>
- License: Apache License 2.0
- Current use: future architecture research only; no code, model artifact, or output incorporated
- Future requirement: retain the license and NOTICE obligations, document modifications, and keep the GPU worker isolated from the browser product

## Metro Manila administrative boundaries

- Source: GeoRisk Philippines / PSA Municipal Boundary layer
- Service: <https://ulap-nga.georisk.gov.ph/arcgis/rest/services/PSA/MunicipalPopMF/MapServer/2>
- Current use: the 17 Metro Manila city and municipality polygons are stored in `public/data/metro-manila-cities.json` and credited in the map attribution
- Refresh workflow: run `bun run data:boundaries` to rebuild the local asset from the source layer

Map tiles use OpenStreetMap data with CARTO styling. Their attribution is shown directly on the map. Production use must comply with the chosen map and tile provider's terms and operational requirements.
