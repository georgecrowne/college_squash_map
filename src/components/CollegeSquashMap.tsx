"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl, { LngLatLike, Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const DEFAULT_MAP_LAT_LNG = [-98.5795, 39.8283];
const DEFAULT_MAP_ZOOM = 3;
const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

interface Player {
  name: string;
  team: string;
  city: string;
  country: string;
  display_location: string;
  lng: number;
  lat: number;
}

interface CollegeSquashMapProps {
  currentPlayer: Player | null;
  players: Player[];
}

export default function CollegeSquashMap({
  currentPlayer,
  players,
}: CollegeSquashMapProps) {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const mapLoadedRef = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createPopupHTML = (player: Player | null) => {
    if (!player) return "";
    return `
      <div class="mapbox-popup" style="color: black;">
        <div>${player.name}</div>
        <div class="mapbox-popup-body">${player.team}</div>
        <div class="mapbox-popup-body">${player.display_location}</div>
      </div>
    `;
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: DEFAULT_MAP_STYLE,
        center: DEFAULT_MAP_LAT_LNG as LngLatLike,
        zoom: DEFAULT_MAP_ZOOM,
      });

      mapRef.current = map;

      map.on("load", () => {
        mapLoadedRef.current = true;

        map.addSource("players", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: players.map((player) => ({
              type: "Feature",
              properties: {
                player: player.name,
                team: player.team,
                city: player.city,
                display_location: player.display_location,
              },
              geometry: {
                type: "Point",
                coordinates: [player.lng ?? 0, player.lat ?? 0],
              },
            })),
          },
        });

        map.addLayer({
          id: "player-markers",
          type: "circle",
          source: "players",
          paint: {
            "circle-radius": 6,
            "circle-color": "#B42222",
          },
        });

        map.on("click", "player-markers", (e) => {
          const features = e.features;
          if (features && features.length > 0) {
            const coordinates = (
              features[0].geometry as { coordinates: number[] }
            ).coordinates.slice();
            const playersHTML = features
              .map((feature) =>
                createPopupHTML({
                  name: feature.properties?.player ?? "",
                  team: feature.properties?.team ?? "",
                  city: feature.properties?.city ?? "",
                  country: "",
                  display_location: feature.properties?.display_location ?? "",
                  lng: coordinates[0],
                  lat: coordinates[1],
                })
              )
              .join('<hr class="my-2">');

            popupRef.current?.remove();
            popupRef.current = new mapboxgl.Popup({
              className: "mapbox-popup",
              closeButton: false,
              closeOnClick: true,
            })
              .setLngLat([coordinates[0], coordinates[1]])
              .setHTML(playersHTML)
              .addTo(map);
          }
        });

        map.on("mouseenter", "player-markers", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "player-markers", () => {
          map.getCanvas().style.cursor = "";
        });
      });
    }

    return () => {
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [players]);

  useEffect(() => {
    if (mapRef.current && mapLoadedRef.current) {
      const source = mapRef.current.getSource("players");
      if (source) {
        const playerGeoJSON: FeatureCollection = {
          type: "FeatureCollection",
          features: players.map((player) => ({
            type: "Feature",
            properties: {
              player: player.name,
              team: player.team,
              city: player.city,
              display_location: player.display_location,
            },
            geometry: {
              type: "Point",
              coordinates: [player.lng ?? 0, player.lat ?? 0],
            },
          })),
        };

        (source as mapboxgl.GeoJSONSource).setData(playerGeoJSON);
      }
    }
  }, [players]);

  useEffect(() => {
    if (mapRef.current && currentPlayer) {
      mapRef.current.flyTo({
        center: [currentPlayer.lng, currentPlayer.lat],
        zoom: 8,
        duration: 2000,
      });

      popupRef.current?.remove();
      popupRef.current = new mapboxgl.Popup({
        className: "mapbox-popup",
        closeButton: false,
        closeOnClick: true,
      })
        .setLngLat([currentPlayer.lng, currentPlayer.lat])
        .setHTML(createPopupHTML(currentPlayer))
        .addTo(mapRef.current);
    } else if (mapRef.current) {
      popupRef.current?.remove();
    }
  }, [createPopupHTML, currentPlayer]);

  return <div ref={mapContainerRef} className="h-full w-full rounded-lg" />;
}
