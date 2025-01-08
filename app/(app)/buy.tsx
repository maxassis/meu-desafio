import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import Left from "../../assets/arrow-left.svg";
import Bolinha from "../../assets/bolinha.svg";

export default function Buy() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <View className="w-full h-[406px]">
        <ImageBackground
          source={require("../../assets/Card-back.png")}
          className="flex-1 px-4"
        >
          <View className="mt-[35px]">
            <TouchableOpacity
              onPress={() => router.push("/dashboard")}
              className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
            >
              <Left />
            </TouchableOpacity>
          </View>

          <View className="w-full h-[374px] mx-auto mt-4 bg-white rounded-t-3xl p-9 ">
            <View>
              <Image
                source={require("../../assets/camisa.png")}
                className="w-full h-[374px] mx-auto"
              />
            </View>
          </View>

          <Text className="text-center text-bondis-gray-secondary text-xs mt-8 mb-16px">
            Arraste para o lado para ver mais imagens
          </Text>

          <View className="justify-between items-center mt-4">
            <Bolinha className="justify-center items-center" />
          </View>

          <Text className="text-center mt-[51px] text-2xl font-inter-bold">Desafio Cidade Maravilhosa</Text>

          <Text className="text-base text-bondis-gray-dark text-center mt-4">150 km virtuais pelos pontos turísticos mais icônicos do Rio 🧡</Text> 

          <TouchableOpacity className="h-[52px] bg-bondis-green mt-[45px] rounded-full justify-center">
            <Text className="text-center font-inter-bold text-base">Quero escolher meu kit</Text>
          </TouchableOpacity> 

        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}
