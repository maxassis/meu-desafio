import { useRef, useMemo, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler 
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

export interface UserData {
  id: string
  avatar_url: string | null
  avatar_filename: string |null
  full_name: string | null
  bio: string | null
  gender: string | null
  sport: string | null
  createdAt: Date
  usersId: string
  username: string
}

export default function Profile() {
  const router = useRouter();
  const { token } = useAuthStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const saveUserData = userDataStore((state) => state.setUserData);
  const getUserData = userDataStore((state) => state.data);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (isBottomSheetOpen) {
        bottomSheetRef.current?.close();
        setIsBottomSheetOpen(false);
        return true;
      }
      return false;
    };
  
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
  
    return () => backHandler.remove();
  }, [isBottomSheetOpen]);
  
  const handleSheetChanges = (index: number) => {
    setIsBottomSheetOpen(index >= 0);
  };

  const fetchUserData = async (): Promise<UserData> => {
    const response = await fetch("https://bondis-app-backend.onrender.com/users/getUserData", {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    saveUserData(data);
    
    return data;
  };

  const { data: userData } = useQuery<UserData, Error>({
    queryKey: ['userData'],
    queryFn: () => fetchUserData(),
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
      <View className="h-[375px] bg-bondis-black">
        <View className="flex-row h-[92px] justify-between mx-4 mt-[45px]">
          <Logo />
          {getUserData.avatar_url ? (
             <Image
             source={{ uri: `${getUserData.avatar_url}` }}
             className="w-[82px] h-[82px] mt-auto rounded-full"
           />
          ) : (
            <Image 
            source={require("../../assets/user2.png")}
            className="w-[72px] h-[72px] mt-auto rounded-full"
            />
          )}

         <TouchableOpacity onPress={() => router.push("/configInit")} className="h-12">   
            <Settings />
         </TouchableOpacity> 
        </View>

        <Text className="text-bondis-green text-lg font-inter-bold text-center mt-[41px]">
          {getUserData.username}
        </Text>
        <Text className="text-center text-bondis-text-gray font-inter-regular text-sm mt-2">
          {getUserData.bio}
        </Text>

        <View className="flex-row justify-between h-[51px] mt-[29px] mx-4">
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

      <View className="h-full">

      <View className="my-[16px] pl-5">
        <Text className="font-inter-bold text-2xl my-auto">Desafios</Text>
      </View>

      <View className="items-center mx-[15px] relative">
        <Image
          className="w-full rounded-2xl"
          source={require("../../assets/Card.png")}
        />
        <TouchableOpacity
          onPress={() => router.push("/map")}
          className="h-[79px] w-11/12 flex-row p-4 rounded-xl justify-between bg-white absolute bottom-[63px]"
        >
          <View>
            <Text className="font-inter-bold text-[16.86px]">
              Cidade Maravilhosa
            </Text>
            <View className="flex-row items-center">
              <Text className="font-inter-bold text-base">154km</Text>
              <Text className="ml-8 text-[#757575] text-xs font-inter-regular">
                3,3% completado
              </Text>
            </View>
          </View>
          <Map />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.expand()}
          className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-0 bottom-2"
        >
          <Plus />
        </TouchableOpacity>
      </View>

      </View>

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
        <BottomSheetView className="flex-1">
          <Text className="font-inter-bold mt-[10px] text-base mx-5 mb-4">
            Adicione um atividade
          </Text>
          <View className="mx-5">
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Via Strava</Text>
            </View>
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Via Apple Saúde</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/desafios")} className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Cadastrar manualmente</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet> 
      </ScrollView>
      <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
    </SafeAreaView>
  );
}
