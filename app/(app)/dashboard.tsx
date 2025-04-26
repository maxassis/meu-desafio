import { useRef, useMemo } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import Logo from "../../assets/logo-white.svg";
import Settings from "../../assets/settings.svg";
import Map from "../../assets/map.svg";
import Plus from "../../assets/plus.svg";
import userDataStore from "../../store/user-data";
import useAuthStore from "../../store/auth-store";
import { useRouter } from "expo-router";
import CardDesafio from "@/components/cardDesafio";

export interface UserData {
  id: string;
  avatar_url: string | null;
  avatar_filename: string | null;
  full_name: string | null;
  bio: string | null;
  gender: string | null;
  sport: string | null;
  createdAt: Date;
  usersId: string;
  username: string;
}

interface AllDesafios {
  id: number;
  name: string;
  description: string;
  distance: string;
  isRegistered: boolean;
  completed: boolean;
  completedAt: null | Date;
  progress: number;
}

export default function Profile() {
  const router = useRouter();
  const { token } = useAuthStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const saveUserData = userDataStore((state) => state.setUserData);

  const fetchUserData = async (): Promise<UserData> => {
    const response = await fetch("http://10.0.2.2:3000/users/getUserData", {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    saveUserData(data);
    return data;
  };

  const fetchAllDesafios = async (): Promise<AllDesafios[]> => {
    const response = await fetch("http://10.0.2.2:3000/desafio/getAllDesafio", {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  };

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    isSuccess: isUserSuccess,
  } = useQuery<UserData, Error>({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 60 * 1000,
  });

  const {
    data: allDesafios,
    isLoading: isDesafiosLoading,
    isError: isDesafiosError,
    isSuccess: isDesafiosSuccess,
  } = useQuery<AllDesafios[], Error>({
    queryKey: ["getAllDesafios"],
    queryFn: fetchAllDesafios,
  });

  const desafiosEmCurso =
    allDesafios?.filter(
      (desafio) => desafio.isRegistered && !desafio.completed
    ) || [];
  const desafiosDisponiveis =
    allDesafios?.filter((desafio) => !desafio.isRegistered) || [];
  const desafiosConcluidos =
    allDesafios?.filter((desafio) => desafio.completed) || [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="h-[300px] bg-bondis-black">
          <View className="flex-row h-[92px] justify-between mx-4 mt-[35px]">
            <Logo />
            {isUserLoading ? (
              <ActivityIndicator size="small" color="#00ff00" />
            ) : isUserSuccess && userData?.avatar_url ? (
              <Image
                source={{ uri: `${userData.avatar_url}` }}
                className="w-[72px] h-[72px] mt-auto rounded-full"
              />
            ) : (
              <Image
                source={require("../../assets/user2.png")}
                className="w-[72px] h-[72px] mt-auto rounded-full"
              />
            )}
            <TouchableOpacity onPress={() => router.push("/configInit")}>
              <Settings />
            </TouchableOpacity>
          </View>

          {isUserLoading && (
            <Text className="text-center text-white mt-5"></Text>
          )}
          {isUserError && (
            <Text className="text-center text-red-500 mt-5">
              Erro ao carregar usuário
            </Text>
          )}
          {isUserSuccess && (
            <>
              <Text className="text-bondis-green text-lg font-inter-bold text-center mt-[29px]">
                {userData.username}
              </Text>
              <Text className="text-center text-bondis-text-gray font-inter-regular text-sm mt-2">
                {userData.bio}
              </Text>
            </>
          )}

          <View className="flex-row justify-between h-[51px] mt-[10px] mx-4">
            <View>
              <Text className="text-white text-lg text-center font-inter-bold">
                1
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                Desafio ativo
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg text-center font-inter-bold">
                0
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                Desafios finalizados
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg text-center font-inter-bold">
                5 km
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                Percorridos
              </Text>
            </View>
          </View>
        </View>

        {/* Parte dos desafios */}
        <View className="h-full">
          {/* Desafios em Curso */}
          <View className="my-4 pl-5">
            <Text className="font-inter-bold text-2xl my-auto">
              Desafios ativos
            </Text>
          </View>

          {isDesafiosLoading && (
            <ActivityIndicator size="large" color="#00ff00" />
          )}
          {isDesafiosError && (
            <Text className="text-center text-red-500">
              Erro ao carregar desafios
            </Text>
          )}
          {isDesafiosSuccess &&
            (desafiosEmCurso.length > 0 ? (
              desafiosEmCurso.map((desafio) => (
                <CardDesafio
                  key={desafio.id}
                  name={desafio.name}
                  distance={desafio.distance}
                  progress={desafio.progress + ""}
                  isRegistered={desafio.isRegistered}
                  completed={desafio.completed}
                />
              ))
            ) : (
              <Text className="text-center text-gray-400">
                Nenhum desafio em curso
              </Text>
            ))}

          {/* Desafios Disponíveis */}
          <View className="mb-4 pl-5">
            <Text className="font-inter-bold text-2xl my-auto">
              Desafios Disponíveis
            </Text>
          </View>

          {isDesafiosSuccess &&
            (desafiosDisponiveis.length > 0 ? (
              desafiosDisponiveis.map((desafio) => (
                <CardDesafio
                  key={desafio.id}
                  name={desafio.name}
                  distance={desafio.distance}
                  progress={desafio.progress + ""}
                />
              ))
            ) : (
              <Text className="text-center text-gray-400">
                Nenhum desafio disponível
              </Text>
            ))}

          {/* Desafios Concluídos */}
          <View className="mb-4 pl-5">
            <Text className="font-inter-bold text-2xl my-auto">
              Desafios Concluídos
            </Text>
          </View>

          {isDesafiosSuccess &&
            (desafiosConcluidos.length > 0 ? (
              desafiosConcluidos.map((desafio) => (
                <CardDesafio
                  key={desafio.id}
                  name={desafio.name}
                  distance={desafio.distance}
                  progress={desafio.progress + ""}
                />
              ))
            ) : (
              <Text className="text-center text-gray-400">
                Nenhum desafio concluído
              </Text>
            ))}
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose
          backgroundStyle={{
            borderRadius: 20,
          }}
        >
          <BottomSheetView className="flex-1">
            <Text className="font-inter-bold mt-[10px] text-base mx-5 mb-4">
              Adicione uma atividade
            </Text>
            <View className="mx-5">
              <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
                <Text>Via Strava</Text>
              </View>
              <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
                <Text>Via Apple Saúde</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/desafios")}
                className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
              >
                <Text>Cadastrar manualmente</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </ScrollView>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
