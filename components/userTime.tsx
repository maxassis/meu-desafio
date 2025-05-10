import { Text, View, Image } from "react-native";
import Arrow from "../assets/arrow.svg";
import { convertSecondsToTimeString } from "../utils/timeUtils";

interface UserTimeProps {
  position: number;
    userId: string;
    userName: string;
    userAvatar: string;
    totalDistance: number;
    totalDuration: number;
    avgSpeed: number;
}

export default function UserTime(data : UserTimeProps) {
  return (
    <View className="w-full h-[50px] flex-row items-center justify-between border-b border-[#EEEEEE]">
      <Image source={require("../assets/user1.png")} />
      <Text className="text-xs font-inter-regular">{data.userName}</Text>
      <Text className="text-xs font-inter-regular">{convertSecondsToTimeString(data.totalDuration)}</Text>
      <Text className="text-xs font-inter-regular">{data.totalDistance}km</Text>
      <View className="bg-black  h-[22px] px-2 py-1 rounded-xl justify-center items-center ">
        <Text className="text-white font-inter-bold text-xs">{data.position}º</Text>
      </View>
      <Arrow />
    </View>
  );
}
