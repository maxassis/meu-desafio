import {
  Text,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Close from "../../assets/Close.svg";
import Logo from "../../assets/logo2.svg";
import Google from "../../assets/google.svg";
import Facebook from "../../assets/facebook.svg";
import Apple from "../../assets/apple.svg";
import useAuthStore from "../../store/auth-store";
import { Link, useRouter } from "expo-router";

type FormData = {
  email: string;
  password: string;
};

type TokenType = {
  access_token: string;
};

const loginRequest = async ({ email, password }: FormData): Promise<TokenType> => {
  const response = await fetch("https://bondis-app-backend.onrender.com/signin/", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Usuário ou senha inválidos");
    } else {
      throw new Error("Erro ao fazer login");
    }
  }

  return response.json(); 
};

export default function Login() {
  const { login } = useAuthStore();
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.access_token); 
      console.log("Login bem-sucedido:", data.access_token);
    },
    onError: (error: any) => {
      Alert.alert(
        "Erro de login",
        error.message,
        [{ text: "Fechar", style: "cancel" }],
        { cancelable: false }
      );
      console.error("Erro ao fazer login:", error);
    },
  });

  const onSubmit = (formData: FormData) => {
    mutation.mutate(formData);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
      <View className="pt-[38px] px-5 bg-white flex-1">
        <View className="items-end mb-[10px]">
          <View className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
            <TouchableOpacity onPress={() => router.push("/intro")}>
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
            required: "Email obrigatório",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido",
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
          Esqueceu a senha?{" "}
          <Link href="/recovery"> 
            <Text className="font-inter-bold underline">Recuperar</Text>
          </Link>
        </Text>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="h-[52px] bg-bondis-green mt-8 rounded-full justify-center items-center"
          disabled={mutation.isPending}
        >
          <Text className="font-inter-bold text-base">
            {mutation.isPending ? "Entrando..." : "Entrar"}
          </Text>
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
      <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
      </ScrollView>
    </SafeAreaView>
  );
}
