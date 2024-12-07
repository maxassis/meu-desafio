import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Image, Text } from "react-native";
import MapView, {
  Polyline,
  PROVIDER_GOOGLE,
  Marker,
  Callout,
} from "react-native-maps";
import { mapStyle } from "../../styles/mapStyles";
import tokenExists from "../../store/auth-store";
import userDataStore from "../../store/user-data";
import { cva } from "class-variance-authority";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface DesafioResponse {
  id: string;
  name: string;
  description: string;
  location: Coordinate[];
  participation: Participation[];
}

interface Participation {
  user: User;
  progress: number;
}

interface User {
  id: string;
  name: string;
  UserData: UserData | null;
}

interface UserData {
  avatar_url: string;
}

interface UserParticipation {
  avatar: string;
  location: LatLng;
  name: string;
  userId: string;
  distance: number;
  percentage: string;
}

interface LatLng {
  latitude: number;
  longitude: number;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateTotalDistance = (coordinates: [number, number][]): number => {
  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];
    totalDistance += haversine(lat1, lon1, lat2, lon2);
  }

  return totalDistance; // Distância total em quilômetros
};

const findPointAtDistance = (
  coordinates: { latitude: number; longitude: number }[],
  distance: number,
) => {
  let traveled = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const { latitude: startLat, longitude: startLon } = coordinates[i];
    const { latitude: endLat, longitude: endLon } = coordinates[i + 1];

    const segmentDistance = haversine(startLat, startLon, endLat, endLon);
    if (traveled + segmentDistance >= distance) {
      const remainingDistance = distance - traveled;
      const ratio = remainingDistance / segmentDistance;

      const newLat = startLat + (endLat - startLat) * ratio;
      const newLon = startLon + (endLon - startLon) * ratio;

      return { latitude: newLat, longitude: newLon };
    }
    traveled += segmentDistance;
  }

  // Caso a distância seja maior que a distância total, retorna o último ponto
  return coordinates[coordinates.length - 1];
};

const calculateUserDistance = (
  coordinates: { latitude: number; longitude: number }[],
  progress: number,
): number => {
  let traveled = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const { latitude: startLat, longitude: startLon } = coordinates[i];
    const { latitude: endLat, longitude: endLon } = coordinates[i + 1];

    const segmentDistance = haversine(startLat, startLon, endLat, endLon);

    if (traveled + segmentDistance >= progress) {
      return traveled + progress;
    }

    traveled += segmentDistance;
  }

  return traveled;
};

const formatPercentage = (progress: number): string => {
  return progress.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    // minimumFractionDigits: 2,
    maximumFractionDigits: 1,
  });
};

const Map: React.FC = () => {
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<any>(0);
  const [userDistance, setUserDistance] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<any>([]);
  const [usersParticipants, setUsersParticipants] = useState<any>([]);
  const [desafio, setDesafio] = useState<DesafioResponse>(
    {} as DesafioResponse,
  );
  const getUserData = userDataStore((state) => state.data);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = tokenExists((state) => state.token);

  const getUserPath = () => {
    if (!routeCoordinates || userDistance === 0) return [];

    const path: Coordinate[] = [];
    let traveled = 0;

    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const startPoint = routeCoordinates[i];
      const endPoint = routeCoordinates[i + 1];

      const segmentDistance = haversine(
        startPoint.latitude,
        startPoint.longitude,
        endPoint.latitude,
        endPoint.longitude,
      );

      if (traveled + segmentDistance >= userDistance) {
        const remainingDistance = userDistance - traveled;
        const ratio = remainingDistance / segmentDistance;

        const newLat =
          startPoint.latitude +
          (endPoint.latitude - startPoint.latitude) * ratio;
        const newLon =
          startPoint.longitude +
          (endPoint.longitude - startPoint.longitude) * ratio;

        path.push(startPoint); // Adiciona o ponto inicial do segmento atual
        path.push({ latitude: newLat, longitude: newLon }); // Adiciona o ponto interpolado onde o usuário está
        break;
      } else {
        path.push(startPoint); // Adiciona o ponto inicial completo do segmento percorrido
        traveled += segmentDistance;
      }
    }

    return path;
  };

  useEffect(() => {
    const fetchGPXFile = async () => {
      try {
        const desafioResponse = await fetch(
          "http://192.168.1.18:3000/desafio/getdesafio/1",
          {
            headers: {
              "Content-type": "application/json",
              authorization: "Bearer " + token,
            },
          },
        );

        if (!desafioResponse.ok) {
          throw new Error("Failed to fetch desafio details");
        }

        const desafioData: DesafioResponse = await desafioResponse.json();
        console.log("Desafio Data:", desafioData);
        setDesafio(desafioData);

        // Use the location array directly
        const coordinates = desafioData.location;
        console.log("Route coordinates:", coordinates);

        if (!Array.isArray(coordinates) || coordinates.length === 0) {
          console.error("Invalid or empty coordinates array");
          setLoading(false);
          return;
        }

        setRouteCoordinates(coordinates);

        const totalDistance = calculateTotalDistance(
          coordinates.map((coord) => [coord.latitude, coord.longitude])
        );
        setTotalDistance(totalDistance);

        const updatedParticipants = desafioData.participation.map((dta) => {
          let userLocation = null;
          let userDistance = 0;
          let progressPercentage = "0";

          try {
            userLocation = findPointAtDistance(coordinates, dta.progress);
            userDistance = calculateUserDistance(coordinates, dta.progress);
            progressPercentage = formatPercentage((userDistance / totalDistance) * 100);
          } catch (error) {
            console.error("Error calculating user progress:", error);
          }

          if (dta.user.id === getUserData?.usersId) {
            setUserProgress(Number(progressPercentage) / 100);
            setUserDistance(dta.progress);
            setUserLocation(userLocation);
          }

          return {
            userId: dta.user.id,
            name: dta.user.name,
            avatar: dta.user.UserData?.avatar_url,
            location: userLocation || coordinates[0],
            distance: userDistance,
            percentage: progressPercentage,
          };
        });

        setUsersParticipants(updatedParticipants);
      } catch (error) {
        console.error("Error in fetchGPXFile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGPXFile();
  }, []);

  // Set initial region based on the first coordinate or default to a location
  const initialRegion: Region = {
    latitude:
      routeCoordinates.length > 0 ? routeCoordinates[0].latitude : -23.5505,
    longitude:
      routeCoordinates.length > 0 ? routeCoordinates[0].longitude : -46.6333,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          className="flex-1 w-full"
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          initialRegion={initialRegion}
        >
          {routeCoordinates.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoordinates.map((coord) => ({
                  latitude: coord.latitude,
                  longitude: coord.longitude,
                }))}
                strokeWidth={4}
                strokeColor="#000"
              />
              <Polyline
                coordinates={getUserPath()}
                strokeWidth={2}
                strokeColor="#12FF55"
              />
            </>
          )}

          {usersParticipants.map((user: UserParticipation, index: number) => (
            <Marker
              key={index}
              coordinate={
                user.distance > totalDistance
                  ? {
                      latitude:
                        routeCoordinates[routeCoordinates.length - 1].latitude,
                      longitude:
                        routeCoordinates[routeCoordinates.length - 1].longitude,
                    }
                  : user.location
              }
              style={
                user.userId === getUserData?.usersId
                  ? { zIndex: 100000, elevation: 100000 }
                  : { zIndex: index, elevation: index }
              }
            >
              <View
                className={userPin({
                  intent: user.userId === getUserData?.usersId ? "user" : null,
                })}
              >
                {user.avatar ? (
                  <Image
                    resizeMode="cover"
                    source={{ uri: user.avatar }}
                    className={photoUser({
                      intent:
                        user.userId === getUserData?.usersId ? "user" : null,
                    })}
                  />
                ) : (
                  <Image
                    source={require("../../assets/user2.png")}
                    className="h-[30px] w-[30px] rounded-full "
                  />
                )}
              </View>
              <Callout tooltip>
                <View className="p-1 w-[150px] bg-bondis-black mb-2 justify-center items-center rounded-md">
                  <Text className="text-bondis-green font-inter-bold">
                    {user.name}
                  </Text>
                  <Text className="text-white">{user.distance} Km</Text>
                </View>
              </Callout>
            </Marker>
          ))}

          {desafio && (
            <Marker
              coordinate={{
                latitude:
                  routeCoordinates[routeCoordinates.length - 1].latitude,
                longitude:
                  routeCoordinates[routeCoordinates.length - 1].longitude,
              }}
            >
              <Image
                source={require("../../assets/final-pin.png")}
                className="h-[40px] w-[40px] rounded-full "
              />
            </Marker>
          )}
        </MapView>
      )}
    </View>
  );
};

export default Map;

const userPin = cva(
  "h-[32px] w-[32px] rounded-full bg-black justify-center items-center",
  {
    variants: {
      intent: {
        user: "bg-bondis-green h-[35px] w-[35px] ",
      },
    },
  },
);

const photoUser = cva("h-[25px] w-[25px] rounded-full", {
  variants: {
    intent: {
      user: "h-[28px] w-[28px]",
    },
  },
});