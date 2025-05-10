import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar
  } from "react-native";
  import Close from "../../../assets/Close.svg";
  import Logo from "../../../assets/logo2.svg";
  import { useForm, Controller } from "react-hook-form";
  import { useRouter } from "expo-router";

  export default function Recovery() {
    const router = useRouter();

    const {
      handleSubmit,
      control,
      formState: { errors },
    } = useForm<{ email: string }>();

    const onSubmit = async ({ email }: { email: string }) => {

      try {
        const response = await fetch("http://10.0.2.2:3000/check-email", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        // console.log(data);

        if (!response.ok) {
               Alert.alert("Email não cadastrado", "", [
                 {
                   text: "Ok",
                   style: "cancel",
                 },
               ]);

            throw new Error(response.statusText);
        }

        router.push({
          pathname: '/recoveryCode',
          params: { email },
        });

      } catch (error) {
        console.error(error);
      }
    };

    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className=" px-5 pt-[38px]">
        <View className="items-end mb-[10px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Close />
          </TouchableOpacity>
        </View>

        <View className="h-[368px] pt-8">
          <Logo />

          <Text className="font-inter-bold text-2xl mt-4">
            Recupere seu acesso
          </Text>
          <Text className="text-bondis-gray-dark mt-4">
            Informe um e-mail válido para redefinir sua senha:
          </Text>

          <Text className="font-inter-bold text-base mt-8">E-mail</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "E-mail obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido",
              }
            }}
            render={({ field: { value, onChange } }) => (
              <TextInput value={value} autoCapitalize="none" onChangeText={onChange} className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4" />
            )}
          />
          {errors.email && (
          <Text className="mt-1 text-bondis-alert-red">
            {String(errors?.email?.message)}
          </Text>
        )}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="h-[52px] bg-bondis-green mt-8 rounded-full justify-center items-center"
          >
            <Text className="font-inter-bold text-base">Recuperar senha</Text>
          </TouchableOpacity>
        </View>
        </View>
        <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
      </SafeAreaView>
    );
  }
