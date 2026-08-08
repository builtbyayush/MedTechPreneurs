export type LocationCity = {
  id: string;
  name: string;
};

export type LocationState = {
  id: string;
  name: string;
  iso2?: string;
  cities: LocationCity[];
};

export type LocationCountry = {
  id: string;
  name: string;
  iso2: string;
};

export type IndiaLocationsDataset = {
  source: {
    name: string;
    url: string;
    release: string;
    license: string;
    country: string;
    iso2: string;
    extractedAt: string;
  };
  country: LocationCountry;
  states: LocationState[];
};
