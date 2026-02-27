"use client";

import { ImageItem } from "@/lib/FetchImages";
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { useRef, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export default function DetailsModal({ ...props }: ImageItem) {
  return (
    <div className="relative z-10 -mt-12 w-full">
      <div className="mx-auto max-w-2xl bg-white rounded-t-3xl shadow-lg p-6 min-h-screen">
        <h2 className="text-xl font-bold mb-1">{props.name}</h2>
        <p className="text-sm text-gray-500 mb-2">{props.description}</p>
        <h3 className="text-lg font-semibold mb-2">{props.restaurant.name}</h3>
        <p className="text-gray-700 whitespace-pre-line">
          {props.restaurant.address}
        </p>

        <APIProvider apiKey={apiKey} language="en">
          <MapContent {...props} />
        </APIProvider>
      </div>
    </div>
  );
}

function MapContent(props: ImageItem) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden">
      <Map
        defaultCenter={{
          lat: props.restaurant.latitude,
          lng: props.restaurant.longitude,
        }}
        defaultZoom={17}
        gestureHandling="none"
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        <AdvancedMarker
          ref={markerRef}
          position={{
            lat: props.restaurant.latitude,
            lng: props.restaurant.longitude,
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Pin />
        </AdvancedMarker>

        {isOpen && markerRef.current && (
          <InfoWindow
            anchor={markerRef.current}
            pixelOffset={[0, -2]}
            headerContent={<b>{props.restaurant.name}</b>}
          >
            <p>{props.restaurant.address}</p>
            <span>View on Google Maps</span>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
