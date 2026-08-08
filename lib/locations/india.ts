import indiaDataset from "@/data/locations/india-states-cities.json";
import type {
  IndiaLocationsDataset,
  LocationCity,
  LocationState,
} from "@/lib/locations/types";

const dataset = indiaDataset as IndiaLocationsDataset;

export const INDIA_COUNTRY_NAME = dataset.country.name;
export const INDIA_COUNTRY_ISO2 = dataset.country.iso2;

const statesById = new Map(
  dataset.states.map((state) => [state.id, state] as const),
);

const statesByName = new Map(
  dataset.states.map(
    (state) => [state.name.toLowerCase(), state] as const,
  ),
);

export function getIndiaStates(): Omit<LocationState, "cities">[] {
  return dataset.states.map(({ id, name, iso2 }) => ({ id, name, iso2 }));
}

export function getIndiaStateById(stateId: string): LocationState | undefined {
  return statesById.get(stateId);
}

export function getIndiaStateByName(
  stateName: string,
): LocationState | undefined {
  const trimmed = stateName.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }
  return statesByName.get(trimmed);
}

export function getCitiesForState(stateId: string): LocationCity[] {
  return statesById.get(stateId)?.cities ?? [];
}

export function getCitiesForStateName(stateName: string): LocationCity[] {
  return getIndiaStateByName(stateName)?.cities ?? [];
}

/** Resolve which state contains a city name (first match). */
export function findStateForCityName(
  cityName: string,
): LocationState | undefined {
  const trimmed = cityName.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  for (const state of dataset.states) {
    if (state.cities.some((city) => city.name.toLowerCase() === trimmed)) {
      return state;
    }
  }

  return undefined;
}

export function isValidIndiaStateCity(
  stateName: string,
  cityName: string,
): boolean {
  const cities = getCitiesForStateName(stateName);
  if (cities.length === 0) {
    return false;
  }
  const cityKey = cityName.trim().toLowerCase();
  return cities.some((city) => city.name.toLowerCase() === cityKey);
}
