import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface desafioProps {
  name: string;
  distance: string;
  progress: string;
  isRegistered?: boolean;
  completed?: boolean;
  desafioId: number
  photo: string
}

export default function CardDesafio({
  name,
  distance,
  progress,
  isRegistered,
  completed,
  desafioId,
  photo
}: desafioProps) {
  const router = useRouter();

  const handleCardPress = () => {
    if (completed) return; 

    if (isRegistered) {
      router.push({pathname: "/map", params: { desafioId }});
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
      className="items-center mb-4 overflow-hidden h-[375px] mx-[15px] bg-gray-200 rounded-2xl"
    >
      <Image
        className="w-full h-full rounded-2xl"
         source={{uri: photo}}
         resizeMode="cover"
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
    </TouchableOpacity>
  );
}

