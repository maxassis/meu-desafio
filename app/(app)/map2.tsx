// import { Text } from "react-native";

// export default function Map2() {
//     return (
//         <Text>Map</Text>
//     )
// }

import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { mapStyle } from "../../styles/mapStyles";
import tokenExists from "../../store/auth-store";
import { router } from "expo-router";
import Left from "../../assets/arrow-left.svg";

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function Map2() {
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [mapReady, setMapReady] = useState(false); // novo estado
  const mapRef = useRef<MapView>(null);
  const token = tokenExists((state) => state.token);

  const fetchRouteData = async () => {
    const response = await fetch(
      "http://10.0.2.2:3000/desafio/getdesafio/10",
      {
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route data");
    }

    const data = await response.json();
    const coordinates = JSON.parse(data.location);

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      throw new Error("Invalid or empty coordinates");
    }

    return coordinates;
  };

  const { data: coordinates, isLoading, isSuccess } = useQuery({
    queryKey: ["routeData"],
    queryFn: fetchRouteData,
    enabled: !!token,
  });

  useEffect(() => {
    if (isSuccess && coordinates && mapReady) {
      console.log("Fazendo fitToCoordinates");
      setRouteCoordinates(coordinates);

      if (mapRef.current && coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [isSuccess, coordinates, mapReady]); // agora escuta o mapReady também

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
      {isLoading ? (
        <ActivityIndicator size="large" color="#12FF55" />
      ) : (
        <MapView
          ref={mapRef}
          onMapReady={() => setMapReady(true)} // 👈 evento do mapa pronto
          className="flex-1 w-full"
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          showsCompass={false}
        >
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#000"
              zIndex={1}
            />
          )}
        </MapView>
      )}

      <TouchableOpacity
        onPress={() => router.push("/dashboard")}
        className="absolute top-[38px] left-[13px] h-[43px]
        w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
      >
        <Left />
      </TouchableOpacity>
    </View>
  );
}







