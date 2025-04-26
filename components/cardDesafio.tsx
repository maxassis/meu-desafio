import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface desafioProps {
  name: string;
  distance: string;
  progress: string;
}

export default function CardDesafio({
  name,
  distance,
  progress,
}: desafioProps) {
  const router = useRouter();

  return (
    <View className="items-center mb-4 overflow-hidden h-[375px] mx-[15px] bg-gray-300 rounded-2xl ">
      <Image
        className="w-full rounded-2xl"
        source={require("../assets/Gray.png")}
      />
      <TouchableOpacity
        onPress={() => router.push("/map")}
        className=" w-11/12 flex-row p-4 rounded-xl  bg-white absolute bottom-[23px]"
      >
        <View>
          <Text className="font-inter-bold text-[16.86px]">{name}</Text>
          <View className="flex-row items-center">
            <Text className="font-inter-bold text-base">{parseFloat(distance).toFixed(2)}km</Text>
            <Text className="ml-8 text-[#757575] text-base font-inter-regular">
            {progress}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
