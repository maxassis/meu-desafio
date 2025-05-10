import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import useDesafioStore from "@/store/desafio-store";

interface desafioProps {
  name: string;
  distance: string;
  progress: string;
  isRegistered?: boolean;
  completed?: boolean;
  desafioId: number; 
  photo: string;
  totalDuration: number;
  taskCount: number; 
  progressPercentage: number;
  inscriptionId: number;
}

export default function CardDesafio({
  name: desafioName,
  distance,
  progress,
  isRegistered,
  completed,
  desafioId,
  photo,
  totalDuration,
  taskCount,
  progressPercentage,
  inscriptionId
}: desafioProps) {
  const router = useRouter();
  const { setMapData } = useDesafioStore();

  const handleCardPress = () => {
    if (completed) return;

    if (isRegistered) {
      setMapData( desafioId, totalDuration, taskCount, progressPercentage, inscriptionId, progressPercentage, desafioName);
      router.push({ pathname: "/map"});
    } else {
      router.push("/buy");
    }
  };

  const formattedProgress = () => {
    const progressNumber = parseFloat(progress);
    if (progressNumber === 100) {
      return "100%";
    } else {
      return `${Math.trunc(progressNumber)}%`;
    }
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={completed ? 1 : 0.9}
      className="items-center mb-4 overflow-hidden h-[375px] mx-[15px] bg-gray-200 rounded-2xl"
    >
      <Image
        className="w-full h-full rounded-2xl"
        source={{ uri: photo }}
        contentFit="cover"
      />
      <View className="w-11/12 flex-row p-4 rounded-xl bg-white absolute bottom-[23px]">
        <View>
          <Text className="font-inter-bold text-[16.86px]">{desafioName}</Text>
          <View className="flex-row items-center">
            <Text className="font-inter-bold text-base">
              {Math.trunc(parseFloat(distance))}km
            </Text>
            <Text className="ml-8 text-[#757575] text-base font-inter-regular">
              {formattedProgress()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
