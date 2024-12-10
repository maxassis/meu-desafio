import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
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
import Left from "../../assets/arrow-left.svg";
import Terceiro from "../../assets/terceira.svg";
import Segundo from "../../assets/segundo.svg";
import Primeiro from "../../assets/primeiro.svg";
import Winner from "../../assets/winner.svg";
import { LinearGradient } from "expo-linear-gradient";
import UserTime from "../../components/userTime";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Progress from "react-native-progress";
import { router } from "expo-router";

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

  return totalDistance;
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
  const progressNumber = Number(progress); // Garante que progress é um número
  let traveled = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const { latitude: startLat, longitude: startLon } = coordinates[i];
    const { latitude: endLat, longitude: endLon } = coordinates[i + 1];

    // Calcula a distância entre dois pontos consecutivos
    const segmentDistance = haversine(startLat, startLon, endLat, endLon);

    // Verifica se o progresso está dentro deste segmento
    if (traveled + segmentDistance >= progressNumber) {
      const remainingProgress = progressNumber - traveled;
      const segmentFraction = remainingProgress / segmentDistance;

      // Retorna a distância acumulada, interpolando dentro do segmento atual
      return traveled + remainingProgress;
    }

    traveled += segmentDistance; // Acumula distância percorrida
  }

  return traveled; // Retorna a distância total percorrida
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
  const [userProgress, setUserProgress] = useState<number>(0);
  const [userDistance, setUserDistance] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [usersParticipants, setUsersParticipants] = useState<
    UserParticipation[]
  >([]);
  const [desafio, setDesafio] = useState<DesafioResponse>(
    {} as DesafioResponse,
  );
  const getUserData = userDataStore((state) => state.data);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = tokenExists((state) => state.token);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["20%", "85%", "100%"], []);
  const mapRef = useRef<MapView>(null);
  const [showBottom, setShowBottom] = useState<boolean>(false);
  const [showBottom2, setShowBottom2] = useState<boolean>(false);
  const [showMarker, setShowMarker] = useState<boolean>(true);

  const getUserPath = useMemo(() => {
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
  }, [routeCoordinates, userDistance]);

  const initialRegion = useMemo<Region>(
    () => ({
      latitude:
        routeCoordinates.length > 0 ? routeCoordinates[0].latitude : -23.5505,
      longitude:
        routeCoordinates.length > 0 ? routeCoordinates[0].longitude : -46.6333,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    }),
    [routeCoordinates],
  );

  useEffect(() => {
    const fetchDesafio = async () => {
      try {
        const desafioResponse = await fetch(
          "https://bondis-app-backend.onrender.com/desafio/getdesafio/7",
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
        setDesafio(desafioData);

        const coordinates = desafioData.location;

        if (!Array.isArray(coordinates) || coordinates.length === 0) {
          console.error("Coordenadas inválidas ou vazias:", coordinates);
          setLoading(false);
          return;
        }

        setRouteCoordinates(coordinates);

        const totalDistance = calculateTotalDistance(
          coordinates.map((coord) => [coord.latitude, coord.longitude]),
        );
        setTotalDistance(totalDistance);

        const updatedParticipants: UserParticipation[] = desafioData.participation.map((dta) => {
          let userLocation: LatLng = { latitude: 0, longitude: 0 };
          let userDistance = 0;
          let progressPercentage = "0";
        
          try {
            userLocation = findPointAtDistance(coordinates, dta.progress) || coordinates[0];
            userDistance = calculateUserDistance(coordinates, dta.progress);
            progressPercentage = formatPercentage(
              (userDistance / totalDistance) * 100,
            );
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
            avatar: dta.user.UserData?.avatar_url || "", // Sempre string
            location: userLocation || coordinates[0],
            distance: userDistance,
            percentage: progressPercentage,
          };
        });

        setUsersParticipants(updatedParticipants);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {        
        setLoading(false);
       
        setTimeout(() => {
          setShowBottom(true);
          setShowMarker(false);
        }, 2000);

        setTimeout(() => {
          setShowBottom2(true);
        }, 2500);
      }
    };

    fetchDesafio();
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
      {loading ? (
        <ActivityIndicator size="large" color="##12FF55" />
      ) : (
        <MapView
          ref={mapRef}
          className="flex-1 w-full"
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          initialRegion={initialRegion}
          showsCompass={false}
        >
          {routeCoordinates.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="#000"
                zIndex={1}
              />
              <Polyline
                coordinates={getUserPath}
                strokeWidth={2}
                strokeColor="#12FF55"
                zIndex={2}
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
              tracksViewChanges={showMarker}
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

          {routeCoordinates.length > 0 && (
            <Marker
              key="final"
              coordinate={{
                latitude:
                  routeCoordinates[routeCoordinates.length - 1].latitude,
                longitude:
                  routeCoordinates[routeCoordinates.length - 1].longitude,
              }}
              style={{ zIndex: 999999, elevation: 999999 }}
              title="Final"
              tracksViewChanges={showMarker}
            >
              <Image
                source={require("../../assets/final-pin.png")}
                className="h-[40px] w-[40px] rounded-full"
              />
            </Marker>
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


      {showBottom ? (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={{
          borderRadius: 20,
        }}
      >
        {showBottom2 ? (
          <BottomSheetScrollView>
            <SafeAreaView className="mx-5">
              <Text className="text-sm font-inter-regular text-bondis-gray-secondary">
                Desafio
              </Text>
              <Text className="text-2xl font-bold font-inter-bold mt-4 mb-4">
                {desafio.name}
              </Text>

              <Progress.Bar
                progress={userProgress ? userProgress : 0}
                width={null}
                height={8}
                color="#12FF55"
                unfilledColor="#565656"
                borderColor="transparent"
                borderWidth={0}
              />

              <Text className="font-inter-bold text-base mt-2">
                {userDistance > totalDistance
                  ? totalDistance.toFixed(3)
                  : userDistance}{" "}
                de {totalDistance.toFixed(3) + " km"}
              </Text>

              <View className="flex-row justify-between mt-6">
                <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
                  <Text className="font-inter-bold text-2xl">1</Text>
                  <Text className="text-[10px] font-inter-regular">
                    ATIVIDADE
                  </Text>
                </View>
                <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
                  <Text className="font-inter-bold text-2xl">00:46</Text>
                  <Text className="text-[10px] font-inter-regular">TREINO</Text>
                </View>
                <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
                  <Text className="font-inter-bold text-2xl">3,3%</Text>
                  <Text className="text-[10px] font-inter-regular">
                    COMPLETADO
                  </Text>
                </View>
              </View>

              <View className="w-full h-[92px] bg-bondis-black mt-6 rounded p-4 flex-row items-center ">
                <Image source={require("../../assets/top.png")} />
                <Text className="flex-1 flex-wrap ml-[10px] text-center">
                  <Text className="text-bondis-green font-inter-bold">
                    {getUserData.username}
                  </Text>
                  <Text
                    numberOfLines={3}
                    className="text-bondis-text-gray font-inter-regular text-justify"
                  >
                    , Mantenha a média de 5km corridos por semana e conclua seu
                    desafio em apenas 10 semanas!
                  </Text>
                </Text>
              </View>

              <Text className="mt-6 font-inter-bold text-lg">
                Classificação Geral
              </Text>

              <View className="flex-row justify-between items-end mt-6">
                <View className="w-[87px] h-[230px] items-center justify-between ">
                  <View className="rounded-full justify-center items-center w-[35.76px] h-[35.76px] bg-bondis-text-gray">
                    <Text className="text-sm font-inter-bold">3</Text>
                  </View>

                  <LinearGradient
                    colors={["#12FF55", "white"]}
                    className="w-full h-[140px] relative justify-end items-center"
                  >
                    <View className="absolute top-[-50px]">
                      <Terceiro />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="font-inter-bold text-sm mb-[10px]"
                    >
                      Nildis Silva
                    </Text>
                    <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
                      25:15
                    </Text>
                  </LinearGradient>
                </View>
                <View className="w-[87px] h-[287px] items-center justify-between">
                  <Winner />
                  <LinearGradient
                    colors={["#12FF55", "white"]}
                    className="w-full h-[200px] relative items-center justify-end"
                  >
                    <View className="absolute top-[-50px]">
                      <Primeiro />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="font-inter-bold text-sm mb-[10px]"
                    >
                      Nildis Silva
                    </Text>
                    <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
                      25:15
                    </Text>
                  </LinearGradient>
                </View>
                <View className="w-[87px] h-[260px] items-center justify-between ">
                  <View className="rounded-full mb-2 justify-center items-center w-[35.76px] h-[35.76px] bg-bondis-text-gray">
                    <Text className="text-sm font-inter-bold">2</Text>
                  </View>

                  <LinearGradient
                    colors={["#12FF55", "white"]}
                    className="relative w-full h-[170px] justify-end items-center"
                  >
                    <View className="absolute top-[-50px] ">
                      <Segundo />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="font-inter-bold text-sm mb-[10px]"
                    >
                      Nildis Silva
                    </Text>
                    <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
                      25:15
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              <View className="w-full mt-8">
                <UserTime />
                <UserTime />
                <UserTime />
                <UserTime />
                <UserTime />
              </View>
            </SafeAreaView>
          </BottomSheetScrollView>
         ) : (
          <ActivityIndicator size="large" color="#12FF55" className="mt-14" />
        )} 
      </BottomSheet>
      ): null }
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
