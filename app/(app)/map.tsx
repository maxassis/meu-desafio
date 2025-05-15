import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StatusBar,
  Text,
  FlatList,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import MapView, {
  Polyline,
  PROVIDER_GOOGLE,
  Marker,
  Camera,
} from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { mapStyle } from "../../styles/mapStyles";
import { router } from "expo-router";
import Left from "../../assets/arrow-left.svg";
import { cva } from "class-variance-authority";
import RankingBottomSheet from "../../components/bottomSheeetMap";
// import { useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import { fetchUserData, fetchRouteData } from "@/utils/api-service";
import useDesafioStore from "@/store/desafio-store";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UserParticipation {
  avatar: string;
  location: LatLng;
  name: string;
  userId: string;
  distance: number;
  percentage: string;
  totalTasks: number;
  totalCalories: number;
  totalDistanceKm: number;
}

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RankData {
  position: number;
  userId: string;
  userName: string;
  userAvatar: string;
  totalDistance: number;
  totalDuration: number;
  avgSpeed: number;
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

const findPointAtDistance = (
  coordinates: { latitude: number; longitude: number }[],
  distance: number
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
  progress: number
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
    maximumFractionDigits: 1,
  });
};

export default function Map2() {
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [userDistance, setUserDistance] = useState<number>(0);
  const [usersParticipants, setUsersParticipants] = useState<
    UserParticipation[]
  >([]);
  const { desafioId } = useDesafioStore();

  // Novo estado para controlar o tipo de mapa
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">(
    "standard"
  );

  // Novos estados para controlar a perspectiva do mapa
  const [tilt, setTilt] = useState<number>(0); // 0 a 60 graus
  // const [bearing, setBearing] = useState<number>(0); // 0 a 359 graus

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
        endPoint.longitude
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

        path.push(startPoint);
        path.push({ latitude: newLat, longitude: newLon });
        break;
      } else {
        path.push(startPoint);
        traveled += segmentDistance;
      }
    }

    return path;
  }, [routeCoordinates, userDistance]);

  // Função para alternar entre os tipos de mapa
  const toggleMapType = () => {
    if (mapType === "standard") {
      setMapType("satellite");
    } else if (mapType === "satellite") {
      setMapType("hybrid");
    } else {
      setMapType("standard");
    }
  };

  // Funções para controlar a perspectiva
  const increaseTilt = () => {
    const newTilt = Math.min(tilt + 15, 60);
    setTilt(newTilt);
    animateCamera({ pitch: newTilt });
  };

  const decreaseTilt = () => {
    const newTilt = Math.max(tilt - 15, 0);
    setTilt(newTilt);
    animateCamera({ pitch: newTilt });
  };

  const resetCamera = () => {
    setTilt(0);
    // setBearing(0);
    animateCamera({ pitch: 0, heading: 0 });

    // Também reajusta o zoom para mostrar toda a rota
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const animateCamera = (cameraParams: Partial<Camera>) => {
    if (mapRef.current) {
      mapRef.current.animateCamera(cameraParams, { duration: 1000 });
    }
  };

  const focusOnUser = (user: UserParticipation) => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: user.location,
          pitch: 60,
          zoom: 16,
        },
        { duration: 1000 }
      );
    }
  };

  const {
    data: routeData,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["routeData", desafioId],
    queryFn: () => fetchRouteData(desafioId + ""),
  });

  useEffect(() => {
    if (isSuccess && routeData && mapReady) {
      const coordinates = routeData.location;
      setRouteCoordinates(coordinates);

      const totalDistance = +routeData.distance;

      const updatedParticipants: UserParticipation[] =
        routeData.inscription.map((dta) => {
          let userLocation: LatLng = { latitude: 0, longitude: 0 };
          let userDistance = 0;
          let progressPercentage = "0";

          try {
            userLocation =
              findPointAtDistance(coordinates, dta.progress) || coordinates[0];
            userDistance = calculateUserDistance(coordinates, dta.progress);
            progressPercentage = formatPercentage(
              (userDistance / totalDistance) * 100
            );
          } catch (error) {
            console.error("Error calculating user progress:", error);
          }

          if (dta.user.id === userConfig?.usersId) {
            setUserProgress(Number(progressPercentage) / 100);
            setUserDistance(dta.progress);
          }

          return {
            userId: dta.user.id,
            name: dta.user.name,
            avatar: dta.user.UserData?.avatar_url || "",
            location: userLocation || coordinates[0],
            distance: userDistance,
            percentage: progressPercentage,
            totalTasks: dta.totalTasks,
            totalCalories: dta.totalCalories,
            totalDistanceKm: dta.totalDistanceKm,
          };
        });

      setUsersParticipants(updatedParticipants);

      if (mapRef.current && coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [isSuccess, routeData, mapReady]);

  const { data: userConfig } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
      {isLoading ? (
        <ActivityIndicator size="large" color="#12FF55" />
      ) : (
        <MapView
          ref={mapRef}
          onMapReady={() => setMapReady(true)}
          className="flex-1 w-full"
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapType === "standard" ? mapStyle : []}
          showsCompass={false}
          toolbarEnabled={false}
          zoomControlEnabled={false}
          mapType={mapType}
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
              onPress={() => {}}
              coordinate={
                user.distance > +routeData!.distance
                  ? {
                      latitude:
                        routeCoordinates[routeCoordinates.length - 1].latitude,
                      longitude:
                        routeCoordinates[routeCoordinates.length - 1].longitude,
                    }
                  : user.location
              }
              style={
                user.userId === userConfig?.usersId
                  ? { zIndex: 100000, elevation: 100000 }
                  : { zIndex: index, elevation: index }
              }
              tracksViewChanges={true}
              title={`${user.name} - ${user.distance} Km`}
            >
              <View
                className={userPin({
                  intent: user.userId === userConfig?.usersId ? "user" : null,
                })}
              >
                {user.avatar ? (
                  <Image
                    resizeMode="cover"
                    source={{ uri: user.avatar }}
                    className={photoUser({
                      intent:
                        user.userId === userConfig?.usersId ? "user" : null,
                    })}
                  />
                ) : (
                  <Image
                    source={require("../../assets/user2.png")}
                    className="h-[32px] w-[32px] rounded-full "
                  />
                )}
              </View>
            </Marker>
          ))}

          {routeCoordinates.length > 0 && (
            <Marker
              key="final"
              onPress={() => {}}
              coordinate={{
                latitude:
                  routeCoordinates[routeCoordinates.length - 1].latitude,
                longitude:
                  routeCoordinates[routeCoordinates.length - 1].longitude,
              }}
              style={{ zIndex: 9999, elevation: 9999 }}
              title="Final"
              tracksViewChanges={true}
            >
              <Image
                source={require("../../assets/final-pin.png")}
                className="h-[40px] w-[40px] rounded-full"
              />
            </Marker>
          )}
        </MapView>
      )}

      {/* Botão para voltar */}
      <TouchableOpacity
        onPress={() => router.push("/dashboard")}
        className="absolute top-[38px] left-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
      >
        <Left />
      </TouchableOpacity>

      {/* Botão para alternar o tipo de mapa */}
      <TouchableOpacity
        onPress={toggleMapType}
        className="absolute top-[38px] right-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center px-3"
      >
        <Octicons name="stack" size={16} color="black" />
      </TouchableOpacity>

      {/* Controles de perspectiva do mapa */}
      <View className="absolute right-[13px] top-[100px] bg-bondis-text-gray rounded-full overflow-hidden">
        {/* Aumentar inclinação */}
        <TouchableOpacity
          onPress={increaseTilt}
          className="h-[40px] w-[40px] justify-center items-center border-b border-gray-400"
        >
          <AntDesign name="arrowup" size={16} color="black" />
        </TouchableOpacity>

        {/* Diminuir inclinação */}
        <TouchableOpacity
          onPress={decreaseTilt}
          className="h-[40px] w-[40px] justify-center items-center border-b border-gray-400"
        >
          <AntDesign name="arrowdown" size={16} color="black" />
        </TouchableOpacity>

        {/* Resetar câmera */}
        <TouchableOpacity
          onPress={resetCamera}
          className="h-[40px] w-[40px] justify-center items-center"
        >
          <AntDesign name="reload1" size={16} color="black" />
        </TouchableOpacity>
      </View>

      <View className="absolute w-full  bottom-[190px] items-center">
        <FlatList
          data={usersParticipants}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => focusOnUser(item)}
              className="p-4 w-[311px] rounded-2xl bg-white"
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start">
                  {item.avatar ? (
                    <ExpoImage
                      source={{ uri: item.avatar }}
                      style={{ width: 43, height: 43, borderRadius: 100 }}
                    />
                  ) : (
                    <Image
                      source={require("../../assets/user2.png")}
                      className="h-[32px] w-[32px] rounded-full"
                    />
                  )}
                  <Text className="text-base font-inter-bold ml-2">
                    {item.name}
                  </Text>
                </View>
                <Text className="text-[#707271] text-[12px]">Há 1 hora</Text>
              </View>

              <View className="flex-row w-1/3 h-[37px] items-center justify-between mt-3">
                <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
                  <Text className="font-inter-bold">{item.percentage}</Text>
                  <Text className="text-[10px] text-bondis-gray-secondary">
                    km
                  </Text>
                </View>
                <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
                  <Text className="font-inter-bold">2</Text>
                  <Text className="text-[10px] text-bondis-gray-secondary">
                    ATIVIDADES
                  </Text>
                </View>
                <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
                  <Text className="font-inter-bold">300</Text>
                  <Text className="text-[10px] text-bondis-gray-secondary">
                    CAL. TOTAIS
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          // renderItem={({ item }) => (
          //   <View className="p-4 w-[311px] rounded-2xl bg-white">
          //     <View className="flex-row items-start justify-between">
          //       <View className="flex-row items-start">
          //         {item.avatar ? (
          //           <ExpoImage
          //             source={{ uri: item.avatar }}
          //             style={{ width: 43, height: 43, borderRadius: 100 }}
          //           />
          //         ) : (
          //           <Image
          //             source={require("../../assets/user2.png")}
          //             className="h-[32px] w-[32px] rounded-full"
          //           />
          //         )}
          //         <Text className="text-base font-inter-bold ml-2">
          //           {item.name}
          //         </Text>
          //       </View>
          //       <Text className="text-[#707271] text-[12px]">Há 1 hora</Text>
          //     </View>

          //     <View className="flex-row w-1/3 h-[37px] items-center justify-between mt-3">
          //       <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
          //         <Text className="font-inter-bold">{item.percentage}</Text>
          //         <Text className="text-[10px] text-bondis-gray-secondary">
          //           km
          //         </Text>
          //       </View>
          //       <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
          //         <Text className="font-inter-bold">2</Text>
          //         <Text className="text-[10px] text-bondis-gray-secondary">
          //           ATIVIDADES
          //         </Text>
          //       </View>
          //       <View className="w-full border-l-2 border-[#D1D5DA] pl-2">
          //         <Text className="font-inter-bold">300</Text>
          //         <Text className="text-[10px] text-bondis-gray-secondary">
          //           CAL. TOTAIS
          //         </Text>
          //       </View>
          //     </View>
          //   </View>
          // )}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <RankingBottomSheet
        routeData={routeData}
        userProgress={userProgress}
        userDistance={userDistance}
        userData={userConfig}
      />

      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </View>
  );
}

const userPin = cva(
  "h-[35px] w-[35px] rounded-full bg-black justify-center items-center",
  {
    variants: {
      intent: {
        user: "bg-bondis-green h-[39px] w-[39px] ",
      },
    },
  }
);

const photoUser = cva("h-[30px] w-[30px] rounded-full", {
  variants: {
    intent: {
      user: "h-[34px] w-[34px]",
    },
  },
});
