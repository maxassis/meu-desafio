import { useRef, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Image } from "expo-image";
import Plus from "../../assets/plus.svg";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import Logo from "../../assets/logo-white.svg";
import Settings from "../../assets/settings.svg";
import { useRouter } from "expo-router";
import CardDesafio from "@/components/cardDesafio";
import { fetchUserData, fetchAllDesafios } from "@/utils/api-service";

export default function Profile() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);

  const isBottomSheetOpen = useRef(false);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    isSuccess: isUserSuccess,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 45 * 60 * 1000,
  });

  const {
    data: allDesafios,
    isLoading: isDesafiosLoading,
    isError: isDesafiosError,
  } = useQuery({
    queryKey: ["getAllDesafios"],
    queryFn: fetchAllDesafios,
    staleTime: 5 * 60 * 1000,
  });

  const desafiosEmCurso =
    allDesafios?.filter(
      (desafio) => desafio.isRegistered && !desafio.completed
    ) || [];
  const desafiosDisponiveis =
    allDesafios?.filter((desafio) => !desafio.isRegistered) || [];
  const desafiosConcluidos =
    allDesafios?.filter((desafio) => desafio.completed) || [];

  const totalDistance = useMemo(() => {
    if (!allDesafios) return 0;
  
    return allDesafios.reduce((total, desafio) => {
      if (desafio.isRegistered && (desafio.completed || !desafio.completed)) {
        return total + (Number(desafio.totalDistanceCompleted) || 0);
      }
      return total;
    }, 0);
  }, [allDesafios]);


  // Formata a distância para exibição (arredonda para o km mais próximo)
  const formattedDistance = `${totalDistance.toFixed(2)} km`;

  const handleOpenBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
      isBottomSheetOpen.current = true;
    }
  };

  const handleCloseBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
      isBottomSheetOpen.current = false;
    }
  };

  // Handle Android back button press
  useEffect(() => {
    const backAction = () => {
      if (isBottomSheetOpen.current) {
        handleCloseBottomSheet();
        return true; // Prevent default back behavior
      }
      return false; // Let default back behavior happen
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Add this callback to track bottom sheet state
  const handleSheetChanges = (index: number) => {
    isBottomSheetOpen.current = index === 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="h-[300px] mb-[10px] bg-bondis-black">
          <View className="flex-row h-[92px] justify-between mx-4 mt-[35px]">
            <Logo />
            {isUserLoading ? (
              <ActivityIndicator size="small" color="#00ff00" />
            ) : isUserSuccess && userData?.avatar_url ? (
              <Image
                source={{ uri: userData.avatar_url }}
                style={{
                  width: 72,
                  height: 72,
                  marginTop: "auto",
                  borderRadius: 999,
                }}
                contentFit="cover"
              />
            ) : (
              <Image
                source={require("../../assets/user2.png")}
                style={{
                  width: 72,
                  height: 72,
                  marginTop: "auto",
                  borderRadius: 999,
                }}
                contentFit="cover"
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
                {desafiosEmCurso.length}
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                {desafiosEmCurso.length === 1
                  ? "Desafio ativo"
                  : "Desafios ativos"}
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg text-center font-inter-bold">
                {desafiosConcluidos.length}
              </Text>
              <Text className="text-[#828282] font-inter-regular">
                Desafios finalizados
              </Text>
            </View>
            <View>
              <Text className="text-white text-lg text-center font-inter-bold">
                {formattedDistance}
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
          {desafiosEmCurso.length > 0 && (
            <>
              <View className="mb-4 pl-5">
                <Text className="font-inter-bold text-2xl my-auto">
                  Desafios ativos
                </Text>
              </View>

              {isDesafiosLoading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : isDesafiosError ? (
                <Text className="text-center text-red-500">
                  Erro ao carregar desafios
                </Text>
              ) : (
                desafiosEmCurso.map((desafio) => (
                  <CardDesafio
                    desafioId={desafio.id}
                    key={desafio.id}
                    name={desafio.name}
                    distance={desafio.distance}
                    progress={desafio.progressPercentage + ""}
                    isRegistered={desafio.isRegistered}
                    completed={desafio.completed}
                    photo={desafio.photo}
                    // totalDuration={desafio.totalDuration}
                    // taskCount={desafio.tasksCount}
                    // progressPercentage={desafio.progressPercentage}
                    inscriptionId={desafio.inscriptionId}
                  />
                ))
              )}
            </>
          )}

          {/* Desafios Disponíveis - Only show if there are available challenges */}
          {!isDesafiosLoading &&
            !isDesafiosError &&
            desafiosDisponiveis.length > 0 && (
              <>
                <View className="mb-4 pl-5">
                  <Text className="font-inter-bold text-2xl my-auto">
                    Desafios Disponíveis
                  </Text>
                </View>

                {desafiosDisponiveis.map((desafio) => (
                  <CardDesafio
                    desafioId={desafio.id}
                    key={desafio.id}
                    name={desafio.name}
                    distance={desafio.distance}
                    progress={desafio.progressPercentage + ""}
                    photo={desafio.photo}
                    // totalDuration={desafio.totalDuration}
                    // taskCount={desafio.tasksCount}
                    // progressPercentage={desafio.progressPercentage}
                    inscriptionId={desafio.inscriptionId} 
                  />
                ))}
              </>
            )}

          {/* Show loading indicator or error for Desafios Disponíveis only if needed */}
          {isDesafiosLoading && (
            <ActivityIndicator size="large" color="#00ff00" />
          )}

          {isDesafiosError && (
            <Text className="text-center text-red-500">
              Erro ao carregar desafios
            </Text>
          )}

          {/* Desafios Concluídos */}
          {desafiosConcluidos.length > 0 && (
            <>
              <View className="mb-4 pl-5">
                <Text className="font-inter-bold text-2xl my-auto">
                  Desafios Concluídos
                </Text>
              </View>

              {isDesafiosLoading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : isDesafiosError ? (
                <Text className="text-center text-red-500">
                  Erro ao carregar desafios
                </Text>
              ) : (
                desafiosConcluidos.map((desafio) => (
                  <CardDesafio
                    desafioId={desafio.id}
                    key={desafio.id}
                    name={desafio.name}
                    distance={desafio.distance}
                    progress={desafio.progressPercentage + ""}
                    completed={desafio.completed}
                    photo={desafio.photo}
                    // totalDuration={desafio.totalDuration}
                    // taskCount={desafio.tasksCount}
                    // progressPercentage={desafio.progressPercentage}
                    inscriptionId={desafio.inscriptionId}                    
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleOpenBottomSheet}
        className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-5 bottom-5"
      >
        <Plus />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
        onChange={handleSheetChanges}
      >
        <BottomSheetView className="flex-1 z-50">
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

      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
