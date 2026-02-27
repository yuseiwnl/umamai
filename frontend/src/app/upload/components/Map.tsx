"use client";

import {
  APIProvider,
  Map,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
  InfoWindow,
  ControlPosition,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import AutocompleteResult from "./autocomplete/autocomplete-result";
import { useStore } from "@/lib/UseStore";

// We wrap the MapContent with APIProvider so that Google Places API can be initiated

export default function MapPage() {
  return (
    <div className="mt-2">
      <MapContent />
    </div>
  );
}

function MapContent() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 35.6813039, lng: 139.7644909 });
  const { place } = useStore();

  // Sets the user's location as the center of the map
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (error) => {
          console.warn("Geolocation error: ", error);
        }
      );
    }
  }, []);

  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden">
      <Map
        defaultCenter={location}
        center={place?.location}
        defaultZoom={15}
        gestureHandling="none"
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        <AutocompleteResult place={place} />
      </Map>
    </div>
  );
}
