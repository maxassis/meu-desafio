import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
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

export default function DesafioSelect() {
  const [desafios, setDesafios] = useState<DesafioData | null>(null);
  const token = tokenExists((state) => state.token);
 
  const setDesafioData = useDesafioStore((state) => state.setDesafioData);

  useEffect(() => {
    fetch("http://192.168.1.18:3000/desafio/getuserdesafio/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json() as Promise<DesafioData>)
      .then((res) => {
        setDesafios(res)
        


      } )
      .catch((error) => {
        console.error("Failed to fetch desafios:", error);
        setDesafios([]);
      });
  }, [token]);

  return (
    <SafeAreaView className=" bg-white flex-1">
      <View className="pt-[38px] px-5">
        <View className="mb-[10px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Left />
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-inter-bold mt-7 mb-7">
          Escolha um desafio
        </Text>

        {desafios && desafios.length > 0 ? (
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
        ) : (
          <Text className="text-center text-gray-500">
            Nenhum desafio disponível no momento.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
