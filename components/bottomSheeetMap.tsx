import React, { useRef, useMemo } from "react";
import { View, Text, Image, SafeAreaView, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Progress from "react-native-progress";
import { LinearGradient } from "expo-linear-gradient";
import UserTime from "./userTime";
import {
  type RouteResponse,
  type RankData,
  type UserData,
} from "@/utils/api-service";
import Winner from "../assets/winner.svg";
import { convertSecondsToTimeString } from "../utils/timeUtils";
import useDesafioStore from "@/store/desafio-store";
import { router } from "expo-router";

interface BottomSheetProps {
  routeData: RouteResponse | undefined;
  userProgress: number;
  userDistance: number;
  userData: UserData | undefined;
  rankData: RankData[] | undefined;
  isLoading?: boolean;
}

const RankingBottomSheet = ({
  routeData,
  userProgress,
  userDistance,
  userData,
  rankData,
  isLoading = false, 
 
}: BottomSheetProps) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["20%", "85%", "100%"], []);
  const { totalDuration, taskCount, progressPercentage } = useDesafioStore();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backgroundStyle={{
        borderRadius: 20,
      }}
    >
      <BottomSheetScrollView>
        <SafeAreaView className="mx-5">
          <Text className="text-sm font-inter-regular text-bondis-gray-secondary">
            Desafio
          </Text>
          <Text className="text-2xl font-bold font-inter-bold mt-4 mb-4">
            {routeData?.name}
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

          <Text
            className="font-inter-bold text-base mt-2"
            style={{ opacity: isLoading ? 0 : 1 }}
          >
            {!isLoading ? (
              <>
                {userDistance > Number(routeData?.distance)
                  ? Number(routeData?.distance).toFixed(3)
                  : userDistance}{" "}
                de {Number(routeData?.distance).toFixed(3) + " km"}
              </>
            ) : (
              "0.000 de 0.000 km"
            )}
          </Text>

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity onPress={() => router.push({ pathname: "/taskList", params: { origin: "map" }} )} className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
              <Text className="font-inter-bold text-2xl">{taskCount}</Text>
              <Text className="text-[10px] font-inter-regular">ATIVIDADE</Text>
            </TouchableOpacity>
            <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
              <Text className="font-inter-bold text-2xl">
                {convertSecondsToTimeString(+totalDuration)}
              </Text>
              <Text className="text-[10px] font-inter-regular">TREINO</Text>
            </View>
            <View className="h-[88px] w-3/12 border-[0.8px] border-[#D9D9D9] rounded justify-center items-center">
              <Text className="font-inter-bold text-2xl">
                {Math.trunc(progressPercentage)}%
              </Text>
              <Text className="text-[10px] font-inter-regular">COMPLETADO</Text>
            </View>
          </View>

          <View className="w-full h-[92px] bg-bondis-black mt-6 rounded p-4 flex-row items-center ">
            <Image source={require("../assets/top.png")} />
            <Text className="flex-1 flex-wrap ml-[10px] text-center">
              <Text className="text-bondis-green font-inter-bold">
                {userData?.username}
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
            {/* Terceira Posição */}
            {rankData && rankData.length > 2 && rankData[2]?.userId ? (
              <View className="w-[87px] h-[230px] items-center justify-between ">
                <View className="rounded-full justify-center items-center w-[35.76px] h-[35.76px] bg-bondis-text-gray">
                  <Text className="text-sm font-inter-bold">3</Text>
                </View>

                <LinearGradient
                  colors={["#12FF55", "white"]}
                  className="w-full h-[140px] relative justify-end items-center"
                >
                  <View className="absolute top-[-50px] bg-white rounded-full flex items-center justify-center w-[92px] h-[91px]">
                    <Image
                      className="w-[85px] h-[85px] rounded-full"
                      source={
                        rankData[2].userAvatar
                          ? { uri: rankData[2].userAvatar }
                          : require("../assets/user2.png")
                      }
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="font-inter-bold text-sm mb-[10px]"
                  >
                    {rankData[2].userName}
                  </Text>
                  <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
                    {convertSecondsToTimeString(rankData[2].totalDuration)}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View className="w-[87px] h-[230px]" />
            )}

            {/* Primeira Posição */}
            {rankData && rankData.length > 0 && rankData[0]?.userId ? (
              <View className="w-[87px] h-[287px] items-center justify-between">
                <Winner />
                <LinearGradient
                  colors={["#12FF55", "white"]}
                  className="w-full h-[200px] relative items-center justify-end"
                >
                  <View className="absolute top-[-50px] bg-white rounded-full flex items-center justify-center w-[92px] h-[91px]">
                    <Image
                      className="w-[85px] h-[85px] rounded-full"
                      source={
                        rankData[0].userAvatar
                          ? { uri: rankData[0].userAvatar }
                          : require("../assets/user2.png")
                      }
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="font-inter-bold text-sm mb-[10px]"
                  >
                    {rankData[0].userName}
                  </Text>
                  <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
                    {convertSecondsToTimeString(rankData[0].totalDuration)}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View className="w-[87px] h-[287px]" />
            )}

            {/* Segunda Posição */}
            {rankData && rankData.length > 1 && rankData[1]?.userId ? (
              <View className="w-[87px] h-[260px] items-center justify-between ">
                <View className="rounded-full mb-2 justify-center items-center w-[35.76px] h-[35.76px] bg-bondis-text-gray">
                  <Text className="text-sm font-inter-bold">2</Text>
                </View>

                <LinearGradient
                  colors={["#12FF55", "white"]}
                  className="relative w-full h-[170px] justify-end items-center"
                >
                  <View className="absolute top-[-50px] bg-white rounded-full flex items-center justify-center w-[92px] h-[91px]">
                    <Image
                      className="w-[85px] h-[85px] rounded-full"
                      source={
                        rankData[1].userAvatar
                          ? { uri: rankData[1].userAvatar }
                          : require("../assets/user2.png")
                      }
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="font-inter-bold text-sm mb-[10px]"
                  >
                    {rankData[1].userName}
                  </Text>
                  <Text className="font-inter-regular text-xs text-[#757575] mb-[10px]">
                    {convertSecondsToTimeString(rankData[1].totalDuration)}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View className="w-[87px] h-[260px]" />
            )}
          </View>

          <View className="mt-12">
          {userData &&
            rankData &&
            (() => {
              const userInRank = rankData.find(
                (r) => r.userId === userData.usersId
              );
              
              // Verifica se o usuário está no rank E se está fora do top 3 (posição >= 4)
              if (userInRank && userInRank.position >= 4) {
                return (
                  <UserTime
                    key={userInRank.userId}
                    position={userInRank.position}
                    userId={userInRank.userId}
                    userName={userInRank.userName}
                    userAvatar={userInRank.userAvatar}
                    totalDistance={userInRank.totalDistance}
                    totalDuration={userInRank.totalDuration}
                    avgSpeed={userInRank.avgSpeed}
                  />
                );
              }

              return null;
            })()}
            </View>  
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default RankingBottomSheet;
