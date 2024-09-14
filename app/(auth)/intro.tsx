import React, { useCallback } from "react";
import {
  Text,
  ImageBackground,
  SafeAreaView,
  View,
  TouchableOpacity,
  StatusBar
} from "react-native";
import {
  Inter_700Bold,
  Inter_400Regular,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from 'expo-splash-screen';
import Logo from "../../assets/Logo3.svg";
import { Link, useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function Intro() {
  const router = useRouter();

  let [fontsLoaded, fontError] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
      <ImageBackground
        className="flex-1 justify-end"
        source={require("../../assets/Background.png")}
        resizeMode="cover"
      >
        <View className="h-[305px] mb-[79px] px-[21px] items-center">
          <Logo />

          <Text className="mt-[30px] text-base text-center">
            Olá, seja bem-vindo 👋{"\n"}
            Pronto para encarar um desafio{"\n"} épico na corrida?
          </Text>

          <TouchableOpacity 
            onPress={() => router.push("/createAccount")} 
            className="rounded-full bg-bondis-green h-[51px] w-full justify-center items-center mt-[31px]"
          >
            <Text className="text-base font-inter-bold">Cadastre-se</Text>
          </TouchableOpacity>

          <Text className="text-base mt-4">
            Ja é cadastrado?{" "}  
            <Link href="/login">
              <Text className="font-inter-bold underline text-base">
                Entrar
              </Text>
            </Link>
          </Text>
        </View>
      </ImageBackground>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
    </SafeAreaView>
  );
}
