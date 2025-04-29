import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Plus from "../assets/plus.svg";

interface desafioProps {
  name: string;
  distance: string;
  progress: string;
  isRegistered?: boolean;
  completed?: boolean;
  bottomPress?: () => void
  desafioId: number
}

export default function CardDesafio({
  name,
  distance,
  progress,
  isRegistered,
  completed,
  bottomPress,
  desafioId
}: desafioProps) {
  const router = useRouter();

  const handlePlusPress = () => {
    if (bottomPress) {
      bottomPress();
    } 
  };

  const handleCardPress = () => {
    if (completed) return; 

    if (isRegistered) {
      router.push({pathname: "/map2", params: { desafioId }});
    } else {
      router.push("/buy");
    }
  };

  const formattedProgress = () => {
    const progressNumber = parseFloat(progress);
    if (progressNumber === 100) {
      return "100%";
    } else {
      return `${progressNumber.toFixed(2)}%`;
    }
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={completed ? 1 : 0.9} // Sem efeito visual se concluído
      className="items-center mb-4 overflow-hidden h-[375px] mx-[15px] bg-gray-300 rounded-2xl"
    >
      <Image
        className="w-full rounded-2xl"
        source={require("../assets/Gray.png")}
      />
      <View className="w-11/12 flex-row p-4 rounded-xl bg-white absolute bottom-[23px]">
        <View>
          <Text className="font-inter-bold text-[16.86px]">{name}</Text>
          <View className="flex-row items-center">
            <Text className="font-inter-bold text-base">{parseFloat(distance).toFixed(2)}km</Text>
            <Text className="ml-8 text-[#757575] text-base font-inter-regular">
              {formattedProgress()}
            </Text>
          </View>
        </View>
      </View>

      {isRegistered && !completed && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // evita disparar o click no card
            handlePlusPress();
          }}
          className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-0 bottom-2"
        >
          <Plus />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

