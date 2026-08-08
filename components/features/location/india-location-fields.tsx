"use client";

import { useMemo } from "react";

import {
  authFieldClassName,
  authLabelClassName,
} from "@/components/features/auth/auth-shell";
import {
  getCitiesForState,
  getIndiaStateByName,
  getIndiaStates,
  INDIA_COUNTRY_NAME,
} from "@/lib/locations/india";
import { cn } from "@/lib/utils";

type IndiaLocationFieldsProps = {
  country: string;
  state: string;
  city: string;
  onChange: (next: { country: string; state: string; city: string }) => void;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  disabled?: boolean;
  className?: string;
};

const selectClassName = cn(
  authFieldClassName,
  "flex h-10 w-full appearance-none rounded-lg border px-3 py-2 text-base outline-none md:text-sm",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export function IndiaLocationFields({
  country,
  state,
  city,
  onChange,
  countryId = "location-country",
  stateId = "location-state",
  cityId = "location-city",
  disabled = false,
  className,
}: IndiaLocationFieldsProps) {
  const states = useMemo(() => getIndiaStates(), []);
  const selectedState = useMemo(
    () => (state ? getIndiaStateByName(state) : undefined),
    [state],
  );
  const cities = useMemo(
    () => (selectedState ? getCitiesForState(selectedState.id) : []),
    [selectedState],
  );

  const resolvedCountry = country || INDIA_COUNTRY_NAME;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <label htmlFor={countryId} className={authLabelClassName}>
          Country
        </label>
        <select
          id={countryId}
          value={INDIA_COUNTRY_NAME}
          disabled
          aria-readonly="true"
          className={selectClassName}
        >
          <option value={INDIA_COUNTRY_NAME}>{INDIA_COUNTRY_NAME}</option>
        </select>
        <p className="text-xs text-white/40">
          Location matching currently focuses on India.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor={stateId} className={authLabelClassName}>
          State / UT
        </label>
        <select
          id={stateId}
          value={selectedState?.id ?? ""}
          disabled={disabled}
          className={selectClassName}
          onChange={(event) => {
            const nextState = states.find((item) => item.id === event.target.value);
            onChange({
              country: INDIA_COUNTRY_NAME,
              state: nextState?.name ?? "",
              city: "",
            });
          }}
        >
          <option value="">Select state</option>
          {states.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={cityId} className={authLabelClassName}>
          City
        </label>
        <select
          id={cityId}
          value={city}
          disabled={disabled || !selectedState}
          className={selectClassName}
          onChange={(event) => {
            onChange({
              country: resolvedCountry || INDIA_COUNTRY_NAME,
              state: selectedState?.name ?? state,
              city: event.target.value,
            });
          }}
        >
          <option value="">
            {selectedState ? "Select city" : "Select a state first"}
          </option>
          {cities.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
