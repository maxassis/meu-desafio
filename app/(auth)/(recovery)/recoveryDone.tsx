import { SafeAreaView, Text, View, TouchableOpacity, StatusBar } from "react-native"
import Close from "../../../assets/Close.svg"
import Done from "../../../assets/green-check.svg"
import { useRouter } from "expo-router";

export default function AccountDone() {
    const router = useRouter();

    return(
        <SafeAreaView className="flex-1 bg-white ">
            <View className="items-end mb-[10px] px-5 pt-[38px]">
                <TouchableOpacity onPress={() => router.replace("/login")} className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
                    <Close />
                </TouchableOpacity>
            </View>
            <View className="px-5 h-full justify-center">

            <View className="justify-center items-center flex ">
                <Done />
            </View>

            <Text className="font-inter-bold mt-4 text-2xl text-center">Nova senha cadastrada com sucesso!</Text>

            <Text className="text-sm text-[#565656] mt-8 text-center">bora começar um desafio?</Text>

            <TouchableOpacity onPress={() => router.replace("/login")} className="h-[52px] flex-row mt-8 rounded-full justify-center items-center border-[1px] border-[#D9D9D9]">
                <Text className="font-inter-bold text-base">Entrar</Text> 
            </TouchableOpacity> 
            </View> 
            <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
        </SafeAreaView>    
    )
}