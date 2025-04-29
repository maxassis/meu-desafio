// import React, { useState, useEffect, useRef, useMemo } from "react";
// import {
//   View,
//   ActivityIndicator,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   SafeAreaView,
//   Text,
// } from "react-native";
// import MapView, { Polyline, PROVIDER_GOOGLE, Marker } from "react-native-maps";
// import { useQuery } from "@tanstack/react-query";
// import { mapStyle } from "../../styles/mapStyles";
// import tokenExists from "../../store/auth-store";
// import { router } from "expo-router";
// import Left from "../../assets/arrow-left.svg";
// import userDataStore from "../../store/user-data";
// import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
// import { cva } from "class-variance-authority";
// import * as Progress from "react-native-progress";
// import { LinearGradient } from "expo-linear-gradient";
// import UserTime from "../../components/userTime";
// import Winner from "../../assets/winner.svg";

// interface Coordinate {
//   latitude: number;
//   longitude: number;
// }

// interface RouteResponse {
//   id: string;
//   name: string;
//   description: string;
//   location: string;
//   distance: string;
//   participation: Participation[];
// }

// interface Participation {
//   user: User;
//   progress: number;
// }

// interface User {
//   id: string;
//   name: string;
//   UserData: UserData | null;
// }

// interface UserData {
//   avatar_url: string;
// }

// interface UserParticipation {
//   avatar: string;
//   location: LatLng;
//   name: string;
//   userId: string;
//   distance: number;
//   percentage: string;
// }

// interface LatLng {
//   latitude: number;
//   longitude: number;
// }

// interface RankData {
//   position: number;
//   userId: string;
//   userName: string;
//   userAvatar: string;
//   totalDistance: number;
//   totalDuration: number;
//   avgSpeed: number;
// }

// const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//   const toRad = (x: number) => (x * Math.PI) / 180;
//   const R = 6371; // km
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// const findPointAtDistance = (
//   coordinates: { latitude: number; longitude: number }[],
//   distance: number
// ) => {
//   let traveled = 0;

//   for (let i = 0; i < coordinates.length - 1; i++) {
//     const { latitude: startLat, longitude: startLon } = coordinates[i];
//     const { latitude: endLat, longitude: endLon } = coordinates[i + 1];

//     const segmentDistance = haversine(startLat, startLon, endLat, endLon);
//     if (traveled + segmentDistance >= distance) {
//       const remainingDistance = distance - traveled;
//       const ratio = remainingDistance / segmentDistance;

//       const newLat = startLat + (endLat - startLat) * ratio;
//       const newLon = startLon + (endLon - startLon) * ratio;

//       return { latitude: newLat, longitude: newLon };
//     }
//     traveled += segmentDistance;
//   }

//   // Caso a distância seja maior que a distância total, retorna o último ponto
//   return coordinates[coordinates.length - 1];
// };

// const calculateUserDistance = (
//   coordinates: { latitude: number; longitude: number }[],
//   progress: number
// ): number => {
//   const progressNumber = Number(progress); // Garante que progress é um número
//   let traveled = 0;

//   for (let i = 0; i < coordinates.length - 1; i++) {
//     const { latitude: startLat, longitude: startLon } = coordinates[i];
//     const { latitude: endLat, longitude: endLon } = coordinates[i + 1];

//     // Calcula a distância entre dois pontos consecutivos
//     const segmentDistance = haversine(startLat, startLon, endLat, endLon);

//     // Verifica se o progresso está dentro deste segmento
//     if (traveled + segmentDistance >= progressNumber) {
//       const remainingProgress = progressNumber - traveled;
//       const segmentFraction = remainingProgress / segmentDistance;

//       // Retorna a distância acumulada, interpolando dentro do segmento atual
//       return traveled + remainingProgress;
//     }

//     traveled += segmentDistance; // Acumula distância percorrida
//   }

//   return traveled; // Retorna a distância total percorrida
// };

// const formatPercentage = (progress: number): string => {
//   return progress.toLocaleString("en-US", {
//     minimumIntegerDigits: 2,
//     maximumFractionDigits: 1,
//   });
// };

// function convertHoursToTimeString(totalHours: number): string {
//   const hours = Math.floor(totalHours);
//   const minutes = Math.floor((totalHours - hours) * 60);
//   const seconds = Math.round(((totalHours - hours) * 60 - minutes) * 60);

//   const paddedHours = String(hours).padStart(2, "0");
//   const paddedMinutes = String(minutes).padStart(2, "0");
//   const paddedSeconds = String(seconds).padStart(2, "0");

//   return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
// }

// export default function Map2() {
//   const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
//   const [mapReady, setMapReady] = useState(false);
//   const mapRef = useRef<MapView>(null);
//   const token = tokenExists((state) => state.token);
//   const getUserData = userDataStore((state) => state.data);
//   const [userProgress, setUserProgress] = useState<number>(0);
//   const [userDistance, setUserDistance] = useState<number>(0);
//   const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
//   const [usersParticipants, setUsersParticipants] = useState<
//     UserParticipation[]
//   >([]);
//   const [showMarker, setShowMarker] = useState<boolean>(true);
//   const bottomSheetRef = useRef<BottomSheet>(null);
//   const snapPoints = useMemo(() => ["20%", "85%", "100%"], []);

//   const getUserPath = useMemo(() => {
//     if (!routeCoordinates || userDistance === 0) return [];

//     const path: Coordinate[] = [];
//     let traveled = 0;

//     for (let i = 0; i < routeCoordinates.length - 1; i++) {
//       const startPoint = routeCoordinates[i];
//       const endPoint = routeCoordinates[i + 1];

//       const segmentDistance = haversine(
//         startPoint.latitude,
//         startPoint.longitude,
//         endPoint.latitude,
//         endPoint.longitude
//       );

//       if (traveled + segmentDistance >= userDistance) {
//         const remainingDistance = userDistance - traveled;
//         const ratio = remainingDistance / segmentDistance;

//         const newLat =
//           startPoint.latitude +
//           (endPoint.latitude - startPoint.latitude) * ratio;
//         const newLon =
//           startPoint.longitude +
//           (endPoint.longitude - startPoint.longitude) * ratio;

//         path.push(startPoint); // Adiciona o ponto inicial do segmento atual
//         path.push({ latitude: newLat, longitude: newLon }); // Adiciona o ponto interpolado onde o usuário está
//         break;
//       } else {
//         path.push(startPoint); // Adiciona o ponto inicial completo do segmento percorrido
//         traveled += segmentDistance;
//       }
//     }

//     return path;
//   }, [routeCoordinates, userDistance]);

//   const fetchRouteData = async () => {
//     const response = await fetch("http://10.0.2.2:3000/desafio/getdesafio/10", {
//       headers: {
//         "Content-type": "application/json",
//         authorization: "Bearer " + token,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch route data");
//     }

//     const data: RouteResponse = await response.json();

//     // Verifica se a propriedade 'location' existe e é válida
//     if (!data.location || typeof data.location !== "string") {
//       throw new Error("Invalid or missing location data");
//     }

//     const coordinates = JSON.parse(data.location);

//     if (!Array.isArray(coordinates) || coordinates.length === 0) {
//       throw new Error("Invalid or empty coordinates");
//     }

//     return data; // Retorna todos os dados da resposta
//   };

//   const {
//     data: routeData,
//     isLoading,
//     isSuccess,
//   } = useQuery({
//     queryKey: ["routeData"],
//     queryFn: fetchRouteData,
//     enabled: !!token,
//   });

//   useEffect(() => {
//     if (isSuccess && routeData && mapReady) {
//       // Extrai as coordenadas do campo 'location'
//       const coordinates = JSON.parse(routeData.location);
//       setRouteCoordinates(coordinates);

//       const totalDistance = +routeData.distance;

//       const updatedParticipants: UserParticipation[] =
//         routeData.participation.map((dta) => {
//           let userLocation: LatLng = { latitude: 0, longitude: 0 };
//           let userDistance = 0;
//           let progressPercentage = "0";

//           try {
//             userLocation =
//               findPointAtDistance(coordinates, dta.progress) || coordinates[0];
//             userDistance = calculateUserDistance(coordinates, dta.progress);
//             progressPercentage = formatPercentage(
//               (userDistance / totalDistance) * 100
//             );
//           } catch (error) {
//             console.error("Error calculating user progress:", error);
//           }

//           if (dta.user.id === getUserData?.usersId) {
//             setUserProgress(Number(progressPercentage) / 100);
//             setUserDistance(dta.progress);
//             setUserLocation(userLocation);
//           }

//           return {
//             userId: dta.user.id,
//             name: dta.user.name,
//             avatar: dta.user.UserData?.avatar_url || "", // Sempre string
//             location: userLocation || coordinates[0],
//             distance: userDistance,
//             percentage: progressPercentage,
//           };
//         });

//       setUsersParticipants(updatedParticipants);

//       if (mapRef.current && coordinates.length > 0) {
//         mapRef.current.fitToCoordinates(coordinates, {
//           edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//           animated: true,
//         });
//       }
//     }
//   }, [isSuccess, routeData, mapReady]); // Agora escuta o mapReady também

//   function fetchRankData(): Promise<RankData[]> {
//     return fetch("http://10.0.2.2:3000/users/getRanking/10", {
//       headers: {
//         "Content-type": "application/json",
//         authorization: "Bearer " + token,
//       },
//     }).then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       return response.json();
//     });
//   }

//   const { data: RankData } = useQuery<RankData[], Error>({
//     queryKey: ["rankData", 10],
//     queryFn: fetchRankData,
//     staleTime: 1000 * 60 * 10, // Dados são considerados frescos por 10 minutos
//     enabled: !!token,
//   });

//   return (
//     <View className="flex-1 bg-white justify-center items-center relative">
//       {isLoading ? (
//         <ActivityIndicator size="large" color="#12FF55" />
//       ) : (
//         <MapView
//           ref={mapRef}
//           onMapReady={() => setMapReady(true)} // Evento do mapa pronto
//           className="flex-1 w-full"
//           provider={PROVIDER_GOOGLE}
//           customMapStyle={mapStyle}
//           showsCompass={false}
//           toolbarEnabled={false} // Desativa a barra de ferramentas/botões
//           zoomControlEnabled={false} // Desativa controles de zoom
//         >
//           {routeCoordinates.length > 0 && (
//             <>
//               <Polyline
//                 coordinates={routeCoordinates}
//                 strokeWidth={4}
//                 strokeColor="#000"
//                 zIndex={1}
//               />
//               <Polyline
//                 coordinates={getUserPath}
//                 strokeWidth={2}
//                 strokeColor="#12FF55"
//                 zIndex={2}
//               />
//             </>
//           )}

//           {usersParticipants.map((user: UserParticipation, index: number) => (
//             <Marker
//               key={index}
//               onPress={() => {}}
//               coordinate={
//                 user.distance > +routeData!.distance
//                   ? {
//                       latitude:
//                         routeCoordinates[routeCoordinates.length - 1].latitude,
//                       longitude:
//                         routeCoordinates[routeCoordinates.length - 1].longitude,
//                     }
//                   : user.location
//               }
//               style={
//                 user.userId === getUserData?.usersId
//                   ? { zIndex: 100000, elevation: 100000 }
//                   : { zIndex: index, elevation: index }
//               }
//               tracksViewChanges={showMarker}
//               title={`${user.name} - ${user.distance} Km`}
//             >
//               <View
//                 className={userPin({
//                   intent: user.userId === getUserData?.usersId ? "user" : null,
//                 })}
//               >
//                 {user.avatar ? (
//                   <Image
//                     resizeMode="cover"
//                     source={{ uri: user.avatar }}
//                     className={photoUser({
//                       intent:
//                         user.userId === getUserData?.usersId ? "user" : null,
//                     })}
//                   />
//                 ) : (
//                   <Image
//                     source={require("../../assets/user2.png")}
//                     className="h-[32px] w-[32px] rounded-full "
//                   />
//                 )}
//               </View>
//             </Marker>
//           ))}

//           {routeCoordinates.length > 0 && (
//             <Marker
//               key="final"
//               onPress={() => {}}
//               coordinate={{
//                 latitude:
//                   routeCoordinates[routeCoordinates.length - 1].latitude,
//                 longitude:
//                   routeCoordinates[routeCoordinates.length - 1].longitude,
//               }}
//               style={{ zIndex: 9999, elevation: 9999 }}
//               title="Final"
//               tracksViewChanges={showMarker}
//             >
//               <Image
//                 source={require("../../assets/final-pin.png")}
//                 className="h-[40px] w-[40px] rounded-full"
//               />
//             </Marker>
//           )}
//         </MapView>
//       )}

//       <TouchableOpacity
//         onPress={() => router.push("/dashboard")}
//         className="absolute top-[38px] left-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
//       >
//         <Left />
//       </TouchableOpacity>

//       <BottomSheet
//         ref={bottomSheetRef}
//         snapPoints={snapPoints}
//         backgroundStyle={{
//           borderRadius: 20,
//         }}
//       >
//         <BottomSheetScrollView>
//           <SafeAreaView className="mx-5">
//             <Text className="text-sm font-inter-regular text-bondis-gray-secondary">
//               Desafio
//             </Text>
//             <Text className="text-2xl font-bold font-inter-bold mt-4 mb-4">
//               {routeData?.name}
//             </Text>

//             <Progress.Bar
//               progress={userProgress ? userProgress : 0}
//               width={null}
//               height={8}
//               color="#12FF55"
//               unfilledColor="#565656"
//               borderColor="transparent"
//               borderWidth={0}
//             />

//             <Text className="font-inter-bold text-base mt-2">
//               {userDistance > Number(routeData?.distance)
//                 ? Number(routeData?.distance).toFixed(3)
//                 : userDistance}{" "}
//               de {Number(routeData?.distance).toFixed(3) + " km"}
//             </Text>

//             <View className="flex-row justify-between mt-6">
//               <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
//                 <Text className="font-inter-bold text-2xl">1</Text>
//                 <Text className="text-[10px] font-inter-regular">
//                   ATIVIDADE
//                 </Text>
//               </View>
//               <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
//                 <Text className="font-inter-bold text-2xl">00:46</Text>
//                 <Text className="text-[10px] font-inter-regular">TREINO</Text>
//               </View>
//               <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
//                 <Text className="font-inter-bold text-2xl">3,3%</Text>
//                 <Text className="text-[10px] font-inter-regular">
//                   COMPLETADO
//                 </Text>
//               </View>
//             </View>

//             <View className="w-full h-[92px] bg-bondis-black mt-6 rounded p-4 flex-row items-center ">
//               <Image source={require("../../assets/top.png")} />
//               <Text className="flex-1 flex-wrap ml-[10px] text-center">
//                 <Text className="text-bondis-green font-inter-bold">
//                   {getUserData.username}
//                 </Text>
//                 <Text
//                   numberOfLines={3}
//                   className="text-bondis-text-gray font-inter-regular text-justify"
//                 >
//                   , Mantenha a média de 5km corridos por semana e conclua seu
//                   desafio em apenas 10 semanas!
//                 </Text>
//               </Text>
//             </View>

//             <Text className="mt-6 font-inter-bold text-lg">
//               Classificação Geral
//             </Text>

//             <View className="flex-row justify-between items-end mt-6">
//               {/* Terceira Posição */}
//               {RankData && RankData.length > 2 && RankData[2]?.userId ? (
//                 <View className="w-[87px] h-[230px] items-center justify-between ">
//                   <View className="rounded-full justify-center items-center w-[35.76px] h-[35.76px] bg-bondis-text-gray">
//                     <Text className="text-sm font-inter-bold">3</Text>
//                   </View>

//                   <LinearGradient
//                     colors={["#12FF55", "white"]}
//                     className="w-full h-[140px] relative justify-end items-center"
//                   >
//                     <View className="absolute top-[-50px] bg-white rounded-full flex items-center justify-center w-[92px] h-[91px]">
//                       <Image
//                         className="w-[85px] h-[85px] rounded-full"
//                         source={{ uri: RankData[2].userAvatar }}
//                       />
//                     </View>
//                     <Text
//                       numberOfLines={2}
//                       className="font-inter-bold text-sm mb-[10px]"
//                     >
//                       {RankData[2].userName}
//                     </Text>
//                     <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
//                       {convertHoursToTimeString(RankData[2].totalDuration)}
//                     </Text>
//                   </LinearGradient>
//                 </View>
//               ) : (
//                 <View className="w-[87px] h-[230px]" />
//               )}

//               {/* Primeira Posição */}
//               {RankData && RankData.length > 0 && RankData[0]?.userId ? (
//                 <View className="w-[87px] h-[287px] items-center justify-between">
//                   <Winner />
//                   <LinearGradient
//                     colors={["#12FF55", "white"]}
//                     className="w-full h-[200px] relative items-center justify-end"
//                   >
//                     <View className="absolute top-[-50px] bg-white rounded-full flex items-center justify-center w-[92px] h-[91px]">
//                       <Image
//                         className="w-[85px] h-[85px] rounded-full"
//                         source={{ uri: RankData[0].userAvatar }}
//                       />
//                     </View>
//                     <Text
//                       numberOfLines={2}
//                       className="font-inter-bold text-sm mb-[10px]"
//                     >
//                       {RankData[0].userName}
//                     </Text>
//                     <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
//                       {convertHoursToTimeString(RankData[0].totalDuration)}
//                     </Text>
//                   </LinearGradient>
//                 </View>
//               ) : (
//                 <View className="w-[87px] h-[287px]" />
//               )}

//               {/* Segunda Posição */}
//               {RankData && RankData.length > 1 && RankData[1]?.userId ? (
//                 <View className="w-[87px] h-[260px] items-center justify-between ">
//                   <View className="rounded-full mb-2 justify-center items-center w-[35.76px] h-[35.76px] bg-bondis-text-gray">
//                     <Text className="text-sm font-inter-bold">2</Text>
//                   </View>

//                   <LinearGradient
//                     colors={["#12FF55", "white"]}
//                     className="relative w-full h-[170px] justify-end items-center"
//                   >
//                     <View className="absolute top-[-50px] bg-white rounded-full flex items-center justify-center w-[92px] h-[91px]">
//                       <Image
//                         className="w-[85px] h-[85px] rounded-full"
//                         source={{ uri: RankData[1].userAvatar }}
//                       />
//                     </View>
//                     <Text
//                       numberOfLines={2}
//                       className="font-inter-bold text-sm mb-[10px]"
//                     >
//                       {RankData[1].userName}
//                     </Text>
//                     <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
//                       {convertHoursToTimeString(RankData[1].totalDuration)}
//                     </Text>
//                   </LinearGradient>
//                 </View>
//               ) : (
//                 <View className="w-[87px] h-[260px]" />
//               )}
//             </View>

//             <View className="w-full mt-8">
//               <UserTime />
//               <UserTime />
//               <UserTime />
//               <UserTime />
//               <UserTime />
//             </View>
//           </SafeAreaView>
//         </BottomSheetScrollView>
//       </BottomSheet>

//       <StatusBar
//         backgroundColor="#000"
//         barStyle="light-content"
//         translucent={false}
//       />
//     </View>
//   );
// }

// const userPin = cva(
//   "h-[35px] w-[35px] rounded-full bg-black justify-center items-center",
//   {
//     variants: {
//       intent: {
//         user: "bg-bondis-green h-[39px] w-[39px] ",
//       },
//     },
//   }
// );

// const photoUser = cva("h-[30px] w-[30px] rounded-full", {
//   variants: {
//     intent: {
//       user: "h-[34px] w-[34px]",
//     },
//   },
// });

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { mapStyle } from "../../styles/mapStyles";
import tokenExists from "../../store/auth-store";
import { router } from "expo-router";
import Left from "../../assets/arrow-left.svg";
import userDataStore from "../../store/user-data";
import { cva } from "class-variance-authority";
import RankingBottomSheet from "../../components/bottomSheeetMap";

interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  distance: string;
  participation: Participation[];
}

interface Participation {
  user: User;
  progress: number;
}

export interface User {
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
  const token = tokenExists((state) => state.token);
  const getUserData = userDataStore((state) => state.data);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [userDistance, setUserDistance] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [usersParticipants, setUsersParticipants] = useState<
    UserParticipation[]
  >([]);
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

  const fetchRouteData = async () => {
    const response = await fetch("http://10.0.2.2:3000/desafio/getdesafio/10", {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch route data");
    }

    const data: RouteResponse = await response.json();

    // Verifica se a propriedade 'location' existe e é válida
    if (!data.location || typeof data.location !== "string") {
      throw new Error("Invalid or missing location data");
    }

    const coordinates = JSON.parse(data.location);

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      throw new Error("Invalid or empty coordinates");
    }

    return data; // Retorna todos os dados da resposta
  };

  const {
    data: routeData,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["routeData"],
    queryFn: fetchRouteData,
    enabled: !!token,
  });

  useEffect(() => {
    if (isSuccess && routeData && mapReady) {
      // Extrai as coordenadas do campo 'location'
      const coordinates = JSON.parse(routeData.location);
      setRouteCoordinates(coordinates);

      const totalDistance = +routeData.distance;

      const updatedParticipants: UserParticipation[] =
        routeData.participation.map((dta) => {
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

      if (mapRef.current && coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [isSuccess, routeData, mapReady]); // Agora escuta o mapReady também

  function fetchRankData(): Promise<RankData[]> {
    return fetch("http://10.0.2.2:3000/users/getRanking/10", {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    });
  }

  const { data: rankData, isLoading: rankLoading } = useQuery<RankData[], Error>({
    queryKey: ["rankData", 10],
    queryFn: fetchRankData,
    staleTime: 1000 * 60 * 10, // Dados são considerados frescos por 10 minutos
    enabled: !!token,
  });

  return (
    <View className="flex-1 bg-white justify-center items-center relative">
      {isLoading ? (
        <ActivityIndicator size="large" color="#12FF55" />
      ) : (
        <MapView
          ref={mapRef}
          onMapReady={() => setMapReady(true)} // Evento do mapa pronto
          className="flex-1 w-full"
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          showsCompass={false}
          toolbarEnabled={false} // Desativa a barra de ferramentas/botões
          zoomControlEnabled={false} // Desativa controles de zoom
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
                user.userId === getUserData?.usersId
                  ? { zIndex: 100000, elevation: 100000 }
                  : { zIndex: index, elevation: index }
              }
              tracksViewChanges={showMarker}
              title={`${user.name} - ${user.distance} Km`}
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
        className="absolute top-[38px] left-[13px] h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
      >
        <Left />
      </TouchableOpacity>

      {/* Using the RankingBottomSheet component */}
      <RankingBottomSheet 
        routeData={routeData}
        userProgress={userProgress}
        userDistance={userDistance}
        userData={getUserData}
        rankData={rankData}
        isLoading={rankLoading}
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