import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
    useMapsLibrary,
    useApiIsLoaded,
    useApiLoadingStatus,
    APILoadingStatus,
} from "@vis.gl/react-google-maps";

const MIN_QUERY_LENGTH = 3;

export interface AddressSuggestion {
    description: string;
    placeId: string;
    structuredFormatting?: {
        mainText: string;
        secondaryText: string;
    };
}

export interface ParsedAddress {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    formattedAddress: string;
}

export const useGooglePlacesAutocomplete = () => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const isApiLoaded = useApiIsLoaded();
    const places = useMapsLibrary("places");
    const autocompleteSuggestionAvailableRef = useRef<boolean>(false);
    const newApiFailedRef = useRef<boolean>(false);
    const apiLoadingStatus: APILoadingStatus = useApiLoadingStatus();

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            window.google &&
            window.google.maps &&
            window.google.maps.importLibrary
        ) {
            window.google.maps
                .importLibrary("places")
                .then((placesLibrary: any) => {
                    if (placesLibrary.AutocompleteSuggestion) {
                        autocompleteSuggestionAvailableRef.current = true;
                    }
                })
                .catch(() => {});
        }
    }, [isApiLoaded]);

    const isReady = useMemo(() => {
        return (
            isApiLoaded &&
            (autocompleteSuggestionAvailableRef.current ||
                (typeof window !== "undefined" &&
                    window.google &&
                    window.google.maps &&
                    window.google.maps.places &&
                    window.google.maps.places.AutocompleteService))
        );
    }, [isApiLoaded]);

    const completeMethod = useCallback(async (event: { query: string }) => {
        const query = event.query?.trim() || "";

        if (query.length < MIN_QUERY_LENGTH) {
            setSuggestions([]);
            return;
        }

        if (
            apiLoadingStatus === APILoadingStatus.LOADING ||
            apiLoadingStatus === APILoadingStatus.NOT_LOADED ||
            apiLoadingStatus === APILoadingStatus.AUTH_FAILURE
        ) {
            console.warn(`Google Maps API status: ${apiLoadingStatus}`);
        }

        const shouldTryNewAPI =
            !newApiFailedRef.current &&
            autocompleteSuggestionAvailableRef.current &&
            typeof window !== "undefined" &&
            window.google &&
            window.google.maps &&
            window.google.maps.importLibrary;

        if (shouldTryNewAPI) {
            try {
                const placesLibrary = await window.google.maps.importLibrary("places");
                const AutocompleteSuggestion = (placesLibrary as any).AutocompleteSuggestion;

                if (!AutocompleteSuggestion) {
                    throw new Error("AutocompleteSuggestion not available");
                }

                const request = {
                    input: query,
                    includedRegionCodes: ["us"],
                    includedPrimaryTypes: ["street_address"],
                };

                const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                const responseSuggestions = response?.suggestions || [];

                if (responseSuggestions.length > 0) {
                    const formattedSuggestions: AddressSuggestion[] = responseSuggestions
                        .map((suggestion: any) => {
                            const placePrediction = suggestion.placePrediction;
                            if (!placePrediction) {
                                return null;
                            }

                            const description =
                                placePrediction.text?.text || placePrediction.description || "";
                            const placeId =
                                placePrediction.placeId || placePrediction.place_id || "";

                            const structuredFormat =
                                placePrediction.structuredFormat ||
                                placePrediction.structured_formatting;

                            return {
                                description,
                                placeId,
                                structuredFormatting: structuredFormat
                                    ? {
                                          mainText:
                                              structuredFormat.mainText ||
                                              structuredFormat.main_text ||
                                              "",
                                          secondaryText:
                                              structuredFormat.secondaryText ||
                                              structuredFormat.secondary_text ||
                                              "",
                                      }
                                    : undefined,
                            };
                        })
                        .filter((s: AddressSuggestion | null) => s !== null) as AddressSuggestion[];

                    setSuggestions(formattedSuggestions);
                } else {
                    setSuggestions([]);
                }
                return;
            } catch (error) {
                newApiFailedRef.current = true;
            }
        }

        if (
            typeof window !== "undefined" &&
            window.google &&
            window.google.maps &&
            window.google.maps.places &&
            window.google.maps.places.AutocompleteService
        ) {
            try {
                const service = new window.google.maps.places.AutocompleteService();

                service.getPlacePredictions(
                    {
                        input: query,
                        types: ["address"],
                        componentRestrictions: { country: "us" },
                    },
                    (predictions, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                            const formattedSuggestions: AddressSuggestion[] = predictions.map(
                                (prediction) => ({
                                    description: prediction.description,
                                    placeId: prediction.place_id,
                                    structuredFormatting: prediction.structured_formatting
                                        ? {
                                              mainText: prediction.structured_formatting.main_text,
                                              secondaryText:
                                                  prediction.structured_formatting.secondary_text ||
                                                  "",
                                          }
                                        : undefined,
                                })
                            );
                            setSuggestions(formattedSuggestions);
                        } else {
                            setSuggestions([]);
                        }
                    }
                );
            } catch (error) {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    }, []);

    const getPlaceDetails = useCallback(
        (placeId: string): Promise<ParsedAddress | null> => {
            return new Promise((resolve) => {
                if (!places) {
                    resolve(null);
                    return;
                }

                const placesService = new places.PlacesService(document.createElement("div"));

                placesService.getDetails(
                    {
                        placeId: placeId,
                        fields: ["address_components", "formatted_address"],
                    },
                    (place, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                            let streetNumber = "";
                            let route = "";
                            let city = "";
                            let state = "";
                            let zipCode = "";

                            place.address_components?.forEach((component) => {
                                const types = component.types;
                                if (types.includes("street_number")) {
                                    streetNumber = component.long_name;
                                }
                                if (types.includes("route")) {
                                    route = component.long_name;
                                }
                                if (types.includes("locality")) {
                                    city = component.long_name;
                                }
                                if (types.includes("administrative_area_level_1")) {
                                    state = component.short_name;
                                }
                                if (types.includes("postal_code")) {
                                    zipCode = component.long_name;
                                }
                            });

                            const streetAddress = `${streetNumber} ${route}`.trim();

                            resolve({
                                streetAddress: streetAddress || place.formatted_address || "",
                                city: city,
                                state: state,
                                zipCode: zipCode,
                                formattedAddress: place.formatted_address || "",
                            });
                        } else {
                            resolve(null);
                        }
                    }
                );
            });
        },
        [places]
    );

    return {
        suggestions,
        completeMethod,
        getPlaceDetails,
        isReady,
    };
};
