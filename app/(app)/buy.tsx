import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Left from "../../assets/arrow-left.svg";
import Bolinha from "../../assets/bolinha.svg";
import Track from "../../assets/track.svg";

export default function Buy() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView overScrollMode="never">
        <ImageBackground
          className="px-5"
          source={require("../../assets/Card-back.png")}
        >
          <View className="mt-[35px]">
            <TouchableOpacity
              onPress={() => router.push("/dashboard")}
              className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
            >
              <Left />
            </TouchableOpacity>
          </View>

          <View className="w-full h-[374px] mt-4 bg-white rounded-t-3xl p-9 ">
            <View>
              <Image
                source={require("../../assets/camisa.png")}
                className="w-full h-[374px] mx-auto"
              />
            </View>
          </View>
        </ImageBackground>

        <Text className="text-center text-bondis-gray-secondary text-xs mt-8 mb-16px">
          Arraste para o lado para ver mais imagens
        </Text>

        <View className="justify-between items-center mt-4">
          <Bolinha className="justify-center items-center" />
        </View>

        <Text className="text-center mt-[51px] text-2xl font-inter-bold">
          Desafio Cidade Maravilhosa
        </Text>

        <Text className="text-base text-bondis-gray-dark text-center mt-4 mx-5">
          150 km virtuais pelos pontos turísticos mais icônicos do Rio 🧡
        </Text>

        <View className="flex-row flex-wrap gap-3 mx-5 mt-4">
          <View className="h-[37px] ml-5 rounded-full flex-row justify-center items-center gap-x-2 bg-bondis-text-gray px-4">
            <Track />
            <Text>150Km</Text>
          </View>

          <View className="h-[37px] ml-5 rounded-full flex-row justify-center items-center gap-x-2 bg-bondis-text-gray px-4">
            <Track />
            <Text>520 Desafios finalizados</Text>
          </View>

          <View className="h-[37px] ml-5 rounded-full flex-row justify-center items-center gap-x-2 bg-bondis-text-gray px-4">
            <Track />
            <Text>Ideal para corrida e caminhada</Text>
          </View>
        </View>

        <TouchableOpacity className="h-[52px] bg-bondis-green mt-[45px] mb-4 rounded-full justify-center mx-5">
          <Text className="text-center font-inter-bold text-base">
            Quero escolher meu kit
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
