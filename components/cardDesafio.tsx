import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Plus from "../assets/plus.svg";

interface desafioProps {
  name: string;
  distance: string;
  progress: string;
  isRegistered?: boolean;
  completed?: boolean;
}

export default function CardDesafio({
  name,
  distance,
  progress,
  isRegistered,
  completed
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


      {isRegistered && !completed && (
        <TouchableOpacity
        // onPress={() => bottomSheetRef.current?.expand()}
        className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-0 bottom-2"
      >
        <Plus />
      </TouchableOpacity>
      )}
      
    </View>
  );
}
