import { useState, useEffect } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StatusBar,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import Left from "../../../assets/arrow-left.svg";
import User from "../../../assets/user.svg";
import { MaskedTextInput } from "react-native-mask-text";
import * as ImagePicker from "expo-image-picker";
import tokenExists from "../../../store/auth-store";
import Modal from "react-native-modal";
import userDataStore from "../../../store/user-data";
import { router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import DropDownPicker from "react-native-dropdown-picker";
import { cva } from "class-variance-authority";

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
  const [bioValue, setBioValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [unMaskedValue, setUnmaskedValue] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const getUserData = userDataStore((state) => state.data);
  const saveUserData = userDataStore((state) => state.setUserData);

  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState("");
  const [genderItems, setGenderItems] = useState([
    { label: "Homem", value: "homem" },
    { label: "Mulher", value: "mulher" },
    { label: "Não binario", value: "nao_binario" },
    { label: "Prefiro não responder", value: "prefiro_nao_responder" },
  ]);

  const [sportsOpen, setSportsOpen] = useState(false);
  const [sportsValue, setSportsValue] = useState("");
  const [sportsItems, setSportsItems] = useState([
    { label: "Corrida", value: "corrida" },
    { label: "Bicicleta", value: "bicicleta" },
  ]);

  const [loadingUpload, setLoadingUpload] = useState(false);

  async function fetchUserData(): Promise<UserData> {
    const response = await fetch(
      "http://192.168.1.19:3000/users/getUserData",
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
      setGenderValue(userData.gender ?? "");
      setSportsValue(userData.sport ?? "");
      setNameValue(userData.full_name ?? "");
      setBioValue(userData.bio ?? "");
      setUnmaskedValue(userData.birthDate ?? "");
    }
  }, [userData]);

  async function uploadAvatar(
    formData: FormData
  ): Promise<uploadAvatarResponse> {
    setLoadingUpload(true);

    const response = await fetch(
      "http://192.168.1.19:3000/users/uploadavatar",
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: "Bearer " + token,
        },
        body: formData,
      }
    );

    setModalVisible(false);
    setLoadingUpload(false);

    if (!response.ok) {
      Alert.alert("Erro ao fazer upload do avatar");
      throw new Error("Erro ao fazer upload do avatar");
    }

    return response.json();
  }

  async function deleteAvatarRequest() {
    setLoadingUpload(true);

    const result = await fetch(
      `http://192.168.1.19:3000/users/deleteavatar`,
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
    setLoadingUpload(false);

    if (!result.ok) {
      console.log("Erro ao deletar avatar", result);

      Alert.alert("Erro ao deletar avatar");
      throw new Error("Erro ao deletar avatar");
    }
    saveUserData({
      usersId: getUserData.usersId,
      avatar_url: null,
      avatar_filename: null,
    });

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

  const {
    mutate: submitForm,
    isPending: isSubmitting,
    error: submitError,
  } = useMutation({
    mutationFn: async () => {
      const result = await fetch(
        "http://192.168.1.19:3000/users/edituserdata",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: nameValue || null,
            bio: bioValue || null,
            gender: genderValue || null,
            sport: sportsValue || null,
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

  const onBackPress = () => {
    if (genderOpen || sportsOpen) {
      setGenderOpen(false);
      setSportsOpen(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, [genderOpen, sportsOpen]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        overScrollMode="never"
        bounces={false}
        renderItem={() => null}
        data={[]}
        ListHeaderComponent={
          <View className="px-5 pb-8 pt-[38px] flex-1">
            <View className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center">
              <Left onPress={() => router.push("/configInit")} />
            </View>
            <Text className="font-inter-bold text-2xl mt-7">
              Mantenha seu perfil atualizado
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="h-[94px] w-[94px] mt-8 relative"
              disabled={loadingUpload}
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
            <View style={{ zIndex: 2000 }}>
              <DropDownPicker
                placeholder="Selecione"
                open={genderOpen}
                value={genderValue}
                items={genderItems}
                setOpen={setGenderOpen}
                setValue={setGenderValue}
                setItems={setGenderItems}
                style={styles.picker}
                dropDownDirection="BOTTOM"
                dropDownContainerStyle={styles.drop}
              />
            </View>

            <Text className="font-inter-bold text-base mt-[23px]">
              Esportes
            </Text>
            <View style={{ zIndex: 1000 }}>
              <DropDownPicker
                placeholder="Selecione"
                open={sportsOpen}
                value={sportsValue}
                items={sportsItems}
                setOpen={setSportsOpen}
                setValue={setSportsValue}
                setItems={setSportsItems}
                style={styles.picker}
                dropDownDirection="BOTTOM"
                dropDownContainerStyle={styles.drop}
              />
            </View>

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
              useNativeDriver={true}
            >
              <View className="w-full h-32 bg-white rounded-lg justify-center items-center px-4">
                {!loadingUpload ? (
                  <>
                    <TouchableOpacity
                      className="w-full pb-4"
                      onPress={pickImage}
                    >
                      <Text className="text-center text-base ">
                        Escolher uma foto na galeria
                      </Text>
                    </TouchableOpacity>

                    <View className="border-b-[0.2px] mb-[bg-bondis-text-gray w-full"></View>

                    <TouchableOpacity
                      className="w-full"
                      onPress={deleteAvatarRequest}
                      disabled={getUserData.avatar_url ? false : true}
                    >
                      <Text
                        className={disabledDeleteBtn({
                          intent: !getUserData.avatar_url ? "disabled" : null,
                        })}
                      >
                        Remover foto
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View className="flex-row justify-center items-center">
                    <Text className="font-inter-bold text-base mr-3">
                      Carregando...
                    </Text>
                    <ActivityIndicator size="large" color="#12FF55" />
                  </View>
                )}
              </View>
            </Modal>
          </View>
        }
      ></FlatList>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  picker: {
    backgroundColor: "#EEEEEE",
    marginTop: 8,
    borderColor: "transparent",
    zIndex: 1000,
  },
  drop: {
    borderColor: "transparent",
    borderWidth: 0,
    backgroundColor: "#EEEEEE",
    marginTop: 9,
  },
});

const disabledDeleteBtn = cva("text-center text-base pt-4 text-[#EB4335]", {
  variants: {
    intent: {
      disabled: "opacity-50",
    },
  },
});
