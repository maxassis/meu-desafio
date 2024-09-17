import { Text, View, Image } from "react-native";
import Arrow from '../assets/arrow.svg'

export default function UserTime() {
  return (
    <View className="w-full h-[50px] flex-row items-center justify-between border-b-2 border-[#EEEEEE]">
      <Image source={require("../assets/user1.png")} />
      <Text className="text-xs font-inter-regular">Macima da Silva</Text>
      <Text className="text-xs font-inter-regular">00:46</Text>
      <Text className="text-xs font-inter-regular">6km</Text>
      <View className="bg-black  h-[22px] px-2 py-1 rounded-xl justify-center items-center ">
        <Text className="text-white font-inter-bold text-xs">104º</Text>
      </View>
      <Arrow />
    </View>
  );
}
