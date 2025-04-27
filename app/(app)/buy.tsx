import { useState } from "react";
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
  const [show, setShow] = useState(false);

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

        {!show && (
        <TouchableOpacity onPress={() => setShow(!show)} className="h-[52px] bg-bondis-green mt-[45px] mb-8 rounded-full justify-center mx-5">
          <Text className="text-center font-inter-bold text-base">
            Quero escolher meu kit
          </Text>
        </TouchableOpacity>
        )}        


          {show && (
          <View>
          <Text className="mx-5 mt-8 text-base font-inter-bold">Descrição:</Text>

          <Text className="mx-5 mt-4 text-base text-justify">Bem-vindo ao Desafio Cidade Maravilhosa, uma jornada única que leva você a percorrer virtualmente 150 km pelos pontos mais icônicos e deslumbrantes do Rio de Janeiro! Este desafio é uma oportunidade imperdível para corredores de todos os níveis, proporcionando uma experiência enriquecedora e motivadora enquanto você se mantém ativo e saudável</Text>

          <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
            <Text className="text-base font-inter-bold mb-[10px]">Percurso</Text>
            <Image className="w-full" source={require("../../assets/map.png")} />
          </View>

          <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
            <Text className="text-base font-inter-bold mb-[10px]">Como participar?</Text>
            <Text className="text-base text-bondis-gray-dark text-justify">Para participar, inscreva-se agora e pague a taxa de inscrição. Após a confirmação do pagamento, você estará oficialmente inscrito e pronto para iniciar sua jornada. Lembre-se de confirmar seu endereço para receber os itens de recompensa ao final do desafio.</Text>

            <Text className="text-base text-bondis-gray-dark mt-8">Preço: R$ 121,00</Text>
          </View>

          <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
            <Text className="text-base font-inter-bold mb-[10px]">Benefícios</Text>
            
            <Text className="text-base text-bondis-gray-dark text-justify">Camisa: Uma camisa exclusiva do Desafio Cidade Maravilhosa 150km.</Text>

            <Text className="text-base text-bondis-gray-dark mt-8 text-justify">Garrafa personalizada: Uma garrafa d'agua personalizada do desafio.</Text>

            <Text className="text-base text-bondis-gray-dark mt-8 text-justify">Medalha de conclusão: Apos completar 100% do desafio, solicite e receba em casa sua medalha de finisher.</Text>

            <Text className="text-base text-bondis-gray-dark mt-8 text-justify">Ranking e Perfil Social: A todo momento acompanhe seu progresso e compare seu desempenho com outros participantes.</Text>
          </View>

          <View className="mx-5 mt-8 p-4 border-[1px] border-[#D9D9D9] rounded-md">
            <Text className="text-base font-inter-bold mb-[10px]">Regras</Text>
            
            <Text className="text-base text-justify text-bondis-gray-dark">1. Inscreva-se no desafio pelo valor de R$ 120,00 e agyarde a chegada do seu Kit starter no endereço informado</Text>

            <Text className="text-base text-justify text-bondis-gray-dark mt-8">2. Rastreie sua atividade de corrida ou caminhada através do dispositivos e aplicativos compativeis, como smartwatches e Strava.</Text>

            <Text className="text-base text-justify text-bondis-gray-dark mt-8">3. Cada quilometro importa! As distâncias acumuladas serão automaticamente registradas no mapa do desafio. Mantenha sua rotina de exercicios até concluir todo o desafio. </Text>

            <Text className="text-base text-justify text-bondis-gray-dark mt-8">4. Ao final do desafio, você poderá reinvindicar o seu kit finisher e compartilhar com o mundo a sua conquista.</Text>
          </View>

          <TouchableOpacity className="h-[52px] bg-bondis-green mt-[45px] mb-4 rounded-full justify-center mx-5">
          <Text className="text-center font-inter-bold text-base">            
            Aceito o desafio 💪
          </Text>
        </TouchableOpacity>
        </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}