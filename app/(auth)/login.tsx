import {
  Text,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import Close from "../../assets/Close.svg";
import Logo from "../../assets/logo2.svg";
import Google from "../../assets/google.svg";
import Facebook from "../../assets/facebook.svg";
import Apple from "../../assets/apple.svg";
// import tokenExists from "../store/auth";
import useAuthStore from "../../store/auth-store";

type FormData = {
  email: string;
  password: string;
};

type TokenType = {
  access_token: string;
};

export default function Login() {
  const { login } = useAuthStore();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch("http://172.22.0.1:3000/signin/", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: TokenType = await response.json();
      
      if (!response.ok && response.status === 401) {
        Alert.alert(
          "Senha ou usuário inválido",
          "Por favor, tente outra vez.",
          [
            {
              text: "Fechar",
              style: "cancel",
            },
          ],
          { cancelable: false }
        );

        throw new Error("Senha ou usuário inválido");
      }

    login(data.access_token);  
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="pt-[38px] px-5 bg-white flex-1">
        <View className="items-end mb-[10px]">
          <View className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
            <TouchableOpacity>
              <Close />
            </TouchableOpacity>
          </View>
        </View>

        <Logo />

        <Text className="font-inter-bold mt-4 text-2xl">Login</Text>
        <Text className="text-bondis-gray-dark mt-4 text-base">
          Informe seu e-mail e senha de acesso:
        </Text>

        <Text className="font-inter-bold text-base mt-8">E-mail</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email obrigatório",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido",
            },
          }}
          render={({ field: { value, onChange } }) => (
            <TextInput
              placeholder="E-mail"
              value={value}
              autoCapitalize="none"
              onChangeText={onChange}
              className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
            />
          )}
        />
        {errors.email && (
          <Text className="mt-1 text-bondis-alert-red">
            {String(errors?.email?.message)}
          </Text>
        )}

        <Text className="mt-8 font-inter-bold text-base">Senha</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: "Digite sua senha" }}
          render={({ field: { value, onChange } }) => (
            <TextInput
              placeholder="Senha"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={onChange}
              value={value}
              className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
            />
          )}
        />
        <Text className="mt-1 text-bondis-alert-red">
          {errors?.password?.message ? String(errors.password.message) : ""}
        </Text>

        <Text className="mt-8 font-inter-regular text-center">
          Esqueceu a senha ?{" "}
          <Text
            className="font-inter-bold underline"
            // onPress={() => navigation.navigate("Recovery")}
          >
            Recuperar
          </Text>
        </Text>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="h-[52px] bg-bondis-green mt-8 rounded-full justify-center items-center"
        >
          <Text className="font-inter-bold text-base">Entrar</Text>
        </TouchableOpacity>

        <Text className="text-center mt-8 text-base text-bondis-gray-dark">
          Ou entre em sua conta:
        </Text>

        <View className="flex-row mt-4 justify-center gap-x-7">
          <Google />
          <Facebook />
          <Apple />
        </View>
      </View>
    </SafeAreaView>
  );
}

