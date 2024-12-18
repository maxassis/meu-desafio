import { View, Text, SafeAreaView, TouchableOpacity, Image, StatusBar } from "react-native";
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
  desafio: Desafio;
}

export interface Desafio {
  id: number;
  name: string;
  description: string;
}

async function fetchDesafios(token: string): Promise<DesafioData> {
  const response = await fetch(
    "https://bondis-app-backend.onrender.com/desafio/getuserdesafio/",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch desafios");
  }

  return response.json();
}

export default function DesafioSelect() {
  const token = tokenExists((state) => state.token);
  const setDesafioData = useDesafioStore((state) => state.setDesafioData);

  const { data: desafios, isLoading, error } = useQuery({
    queryKey: ["desafios"],
    queryFn: () => fetchDesafios(token!),
    enabled: !!token, // Só faz a requisição se o token existir
    retry: 1, // Número de tentativas em caso de erro
    staleTime: 1000 * 60 * 5, // Dados são considerados frescos por 5 minutos
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
          <Text className="text-center text-gray-500">Carregando desafios...</Text>
        )}

        {error && (
          <Text className="text-center text-red-500">
            Erro ao carregar desafios.
          </Text>
        )}

        {desafios && desafios.length > 0  ? (
          desafios.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setDesafioData(item.id, item.desafio.name);
                router.push("/createTask");
              }}
              className="h-[94px] flex-row items-center px-3 py-[15px] border-b-[1px] border-b-[#D9D9D9]"
            >
              <Image source={require("../../assets/Bg.png")} />
              <View className="ml-5">
                <Text className="font-inter-bold">{item.desafio.name}</Text>
                <Text className="font-inter-bold mt-[6.44px]">
                  {item.progress}km
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : null}

        {!isLoading && desafios && desafios.length === 0 && (
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
