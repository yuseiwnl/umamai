"use client";

import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  place: google.maps.places.Place | null;
}

const AutocompleteResult = ({ place }: Props) => {
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const handleMarkerRef = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement | null) => {
      setSelectedMarker(marker);
    },
    []
  );

  const map = useMap();

  // adjust the viewport of the map when the place is changed
  useEffect(() => {
    if (!map || !place) return;
    if (place.viewport) map.fitBounds(place.viewport);
  }, [map, place]);

  if (!place) return null;

  // add a marker for the selected place
  return (
    <>
      <AdvancedMarker position={place.location} ref={handleMarkerRef}>
        <Pin
          background={place.iconBackgroundColor}
          glyph={place.svgIconMaskURI ? new URL(place.svgIconMaskURI) : null}
        />
      </AdvancedMarker>

      <InfoWindow
        anchor={selectedMarker}
        pixelOffset={[0, -2]}
        headerContent={<b>{place.displayName}</b>}
      >
        <h2>{place.formattedAddress}</h2>
      </InfoWindow>
    </>
  );
};

export default React.memo(AutocompleteResult);
