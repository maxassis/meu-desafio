import { Text, Image, ImageBackground, SafeAreaView, View, TouchableOpacity } from "react-native";
import { Inter_700Bold, Inter_400Regular, useFonts } from '@expo-google-fonts/inter'
// import Logo from "../../assets/Logo3.svg"
// import { useNavigation } from "@react-navigation/native";


export default function Intro() {
//   const navigation = useNavigation<any>();
  
let [fontsLoaded, fontError] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ImageBackground className="flex-1 justify-end" source={require("../../assets/Background.png")} resizeMode="cover">
        
        <View className="h-[305px] mb-[79px] px-[21px] items-center">
            {/* <Logo /> */}

            <Text className="mt-[30px] text-base text-center">Olá, seja bem-vindo 👋{"\n"} 
                Pronto para encarar um desafio{"\n"} épico na corrida?
            </Text>

            <TouchableOpacity className="rounded-full bg-bondis-green h-[51px] w-full justify-center items-center mt-[31px]">
                <Text className="text-base font-inter-bold">Cadastre-se</Text>
            </TouchableOpacity>

            <Text className="text-base mt-4">Ja é cadastrado? <Text className="font-inter-bold underline text-base" >Entrar</Text></Text>
        </View>
 
      </ImageBackground>
    </SafeAreaView>
  );
}