import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import Left from "../../assets/arrow-left.svg";
import { router } from "expo-router";
import tokenExists from "../../store/auth-store";
import useDesafioStore from "../../store/desafio-store";

export type DesafioData = Data[];

export interface Data {
  id: number;
  userId: string;
  desafioId: number;
  progress: string;
  completed: boolean;
  desafio: Desafio;
}

export interface Desafio {
  id: number;
  name: string;
  description: string;
  distance: number;
}

async function fetchDesafios(token: string): Promise<DesafioData> {
  const response = await fetch("http://10.0.2.2:3000/desafio/getuserdesafio/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch desafios");
  }

  return response.json();
}

export default function DesafioSelect() {
  const token = tokenExists((state) => state.token);
  const setDesafioData = useDesafioStore((state) => state.setDesafioData);

  const {
    data: desafios,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["desafios"],
    queryFn: () => fetchDesafios(token!),
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="pt-[38px] px-5">
        <View className="mb-[10px]">
          <TouchableOpacity
            onPress={() => router.push("/dashboard")}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Left />
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-inter-bold mt-7 mb-7">
          Escolha um desafio
        </Text>

        {isLoading && (
          <Text className="text-center text-gray-500">
            Carregando desafios...
          </Text>
        )}

        {error && (
          <Text className="text-center text-red-500">
            Erro ao carregar desafios.
          </Text>
        )}

        {desafios && desafios.filter((item) => !item.completed).length > 0
          ? desafios
              .filter((item) => !item.completed)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setDesafioData(
                      item.id,
                      item.desafio.name,
                      +item.progress,
                      item.desafio.distance,
                      item.desafioId
                    );
                    router.push("/createTask");
                  }}
                  className="h-[94px] flex-row items-center px-3 py-[15px] border-b-[1px] border-b-[#D9D9D9]"
                >
                  <Image source={require("../../assets/Bg.png")} />
                  <View className="ml-5">
                    <Text className="font-inter-bold text-base flex-wrap break-words">{item.desafio.name}</Text>
                    <Text className="font-inter-bold mt-[6.44px]">
                      {parseFloat(item.progress).toFixed(2)}km
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
          : !isLoading && (
              <Text className="text-center text-gray-500">
                Nenhum desafio disponível no momento.
              </Text>
            )}
      </View>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
