import { useState, useEffect } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  StatusBar
} from "react-native";
import Left from "../../../assets/arrow-left.svg";
import { useNavigation } from "@react-navigation/native";
import User from "../../../assets/user.svg";
import { MaskedTextInput } from "react-native-mask-text";
import * as ImagePicker from "expo-image-picker";
import tokenExists from "../../../store/auth-store";
import Modal from "react-native-modal";
import userDataStore from "../../../store/user-data";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

type File = {
  type: string;
  uri: string;
  name: string;
};

interface uploadAvatarResponse {
  avatar_url: string;
  avatar_filename: string;
}

interface UserData {
  id: string;
  avatar_url: string | null;
  avatar_filename: string | null;
  full_name: string | null;
  bio: string | null;
  gender: string | null;
  sport: string | null;
  createdAt: Date;
  usersId: string;
  name: string;
  birthDate: string | null;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const getFileSize = async (uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error("Erro ao obter o tamanho do arquivo:", error);
    return 0;
  }
};

export default function ProfileEdit() {
  const token = tokenExists((state) => state.token);
  const navigation = useNavigation<any>();
  const [gender, setGender] = useState("");
  const [sports, setSports] = useState("");
  const [bioValue, setBioValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [unMaskedValue, setUnmaskedValue] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const getUserData = userDataStore((state) => state.data);
  const saveUserData = userDataStore((state) => state.setUserData);

  
  async function fetchUserData(): Promise<UserData> {
    const response = await fetch(
      "https://bondis-app-backend.onrender.com/users/getUserData",
      {
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar os dados do usuário");
    }

    return response.json();
  }

  const {
    data: userData,
    isLoading: errorFetchData,
    error: errorData,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: () => fetchUserData(),
    enabled: !!token,
  });

  useEffect(() => {
    if (userData) {
      setGender(userData.gender ?? "");
      setSports(userData.sport ?? "");
      setNameValue(userData.full_name ?? ""); 
      setBioValue(userData.bio ?? "");
      setUnmaskedValue(userData.birthDate ?? "");
    }
  }, [userData]);

  async function uploadAvatar(
    formData: FormData
  ): Promise<uploadAvatarResponse> {
    const response = await fetch(
      "https://bondis-app-backend.onrender.com/users/uploadavatar",
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: "Bearer " + token,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      Alert.alert("Erro ao fazer upload do avatar");
      throw new Error("Erro ao fazer upload do avatar");
    }    
    Alert.alert("Avatar atualizado com sucesso!");

    return response.json();
  }

  async function deleteAvatarRequest() {
    const result = await fetch(
      `https://bondis-app-backend.onrender.com/users/deleteavatar`,
      {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          filename: getUserData.avatar_filename,
        }),
      }
    );

    setModalVisible(false);

    if (!result.ok) {
      console.log("Erro ao deletar avatar", result);
      
      Alert.alert("Erro ao deletar avatar");
      throw new Error("Erro ao deletar avatar");
    }
    saveUserData({ usersId: getUserData.usersId, avatar_url: null, avatar_filename: null });
    Alert.alert("Avatar deletado com sucesso!");

    return result.json();
  }

 
  const pickImage = async () => {
    let { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
      base64: true,
      allowsMultipleSelection: false,
    });

    if (!canceled && assets) {
      const fileSize = assets[0].uri ? await getFileSize(assets[0].uri) : 0;

      if (fileSize > MAX_FILE_SIZE) {
        Alert.alert(
          "Erro",
          "O arquivo é muito grande. O tamanho máximo permitido é 3 MB."
        );
        return;
      }

      const filename = assets[0].uri.split("/").pop();
      const extend = filename!.split(".").pop();

      const formData = new FormData();
      formData.append("file", {
        name: filename,
        uri: assets[0].uri,
        type: "image/" + extend,
      } as any);

      try {
        const responseData = await uploadAvatar(formData);
        console.log("Upload successful", responseData);
        saveUserData({ ...getUserData, avatar_url: responseData.avatar_url });
      } catch (error) {
        console.error("Upload error", error);
        Alert.alert("Erro", "Falha ao enviar imagem, tente novamente");
      }
    }
  };

  const selectAvatar = () => {
    setModalVisible(false);
    pickImage();
  };

  const {
    mutate: submitForm,
    isPending: isSubmitting,
    error: submitError,
  } = useMutation({
    mutationFn: async () => {
      const result = await fetch(
        "https://bondis-app-backend.onrender.com/users/edituserdata",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: nameValue || null,
            bio: bioValue || null,
            gender: gender || null,
            sport: sports || null,
            birthDate: unMaskedValue || null,
          }),
        }
      );

      if (!result.ok) {
        const data = await result.json();
        Alert.alert("Erro ao salvar alterações");
        throw new Error(data.message || "Erro ao salvar alterações");        
      }

      Alert.alert("Sucesso", "Alterações salvas com sucesso!");
      return result.json();
    },
    onSuccess: (data) => {
      console.log("Alterações salvas com sucesso", data);
      Alert.alert("Sucesso", "Alterações salvas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao salvar alterações:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView overScrollMode="never" bounces={false}>
        <View className="px-5 pb-8 pt-[38px] flex-1">
          <View className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
            <Left onPress={() => router.back()} />
          </View>
          <Text className="font-inter-bold text-2xl mt-7">
            Mantenha seu perfil atualizado
          </Text>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="h-[94px] w-[94px] mt-8 relative"
          >
            {getUserData.avatar_url ? (
              <Image
                source={{ uri: getUserData.avatar_url }}
                className="w-[94px] h-[94px] rounded-full"
              />
            ) : (
              <User />
            )}

            <Image
              source={require("../../../assets/cam.png")}
              className="absolute bottom-[-15px] right-[-10px]"
            />
          </TouchableOpacity>

          <Text className="font-inter-bold text-base mt-[23px]">Nome</Text>
          <TextInput
            placeholder="Nome completo"
            value={nameValue}
            autoCapitalize="none"
            onChangeText={setNameValue}
            className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
          />

          <Text className="font-inter-bold text-base mt-[23px]">Bio</Text>
          <TextInput
            placeholder="Escreva um pouco sobre você..."
            numberOfLines={3}
            value={bioValue}
            autoCapitalize="none"
            onChangeText={setBioValue}
            className="bg-bondis-text-gray rounded-[4px] h-[144px] mt-2 p-4"
            style={{ textAlignVertical: "top" }}
          />

          <Text className="font-inter-bold text-base mt-[23px]">
            Data de Nascimento
          </Text>
          <MaskedTextInput
            placeholder="__/__/____"
            mask="99/99/9999"
            onChangeText={(text, rawText) => {
              setUnmaskedValue(rawText);
            }}
            value={unMaskedValue}
            className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
            keyboardType="numeric"
          />

          <Text className="font-inter-bold text-base mt-[23px]">
            Como você se identifica?
          </Text>

          <Text className="font-inter-bold text-base mt-[23px]">Esportes</Text>

          <TouchableOpacity
            onPress={() => submitForm()}
            disabled={isSubmitting}
            className="h-[52px] mt-8 rounded-full justify-center items-center bg-bondis-green"
          >
            <Text className="font-inter-bold text-base">
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Text>
          </TouchableOpacity>

          <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setModalVisible(false)}
            onBackButtonPress={() => setModalVisible(false)}
          >
            <View className="w-full h-32 bg-white rounded-lg justify-center items-center px-4">
              <TouchableOpacity className="w-full pb-4" onPress={selectAvatar}>
                <Text className="text-center text-base ">
                  Escolher uma foto na galeria
                </Text>
              </TouchableOpacity>

              <View className="border-b-[0.2px] mb-[bg-bondis-text-gray w-full"></View>

              <TouchableOpacity
                className="w-full"
                onPress={deleteAvatarRequest}
              >
                <Text className="text-center text-base pt-4  text-[#EB4335] ">
                  Remover foto
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
    </SafeAreaView>
  );
}
