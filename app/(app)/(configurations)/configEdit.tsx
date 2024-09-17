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
  StyleSheet,
} from "react-native";
import Left from "../../../assets/arrow-left.svg";
import User from "../../../assets/user.svg";
import { MaskedTextInput } from "react-native-mask-text";
import * as ImagePicker from "expo-image-picker";
// import Down from "../../assets/down.svg";
// import RNPickerSelect from "react-native-picker-select";
import Modal from "react-native-modal";
import userDataStore from "../../../store/user-data";
import useAuthStore from "../../../store/auth-store";
import { useRouter } from "expo-router";

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

export default function ProfileEdit() {
  const router = useRouter();
  const { token } = useAuthStore();  
  const [gender, setGender] = useState("");
  const [sports, setSports] = useState("");
  const [bioValue, setBioValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [unMaskedValue, setUnmaskedValue] = useState("");
  // const [imageUrl, setImageUrl] = useState("");
  // const [userData, setUserData] = useState<UserData>({} as UserData);
  // const [reloadImage, setReloadImage] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const saveUserData = userDataStore((state) => state.setUserData);
  const getUserData = userDataStore((state) => state.data);

  const pickImage = async () => {
    let { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0,
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
        const response = await fetch(
          "http://172.22.0.1:3000/users/uploadavatar",
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: "Bearer " + token,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const responseData: uploadAvatarResponse = await response.json();
          console.log("Upload successful", responseData);
          // setImageUrl(responseData.avatar_url);
          // setReloadImage(reloadImage + 1);
          saveUserData({ ...getUserData, avatar_url: responseData.avatar_url });
        } 
      } catch (error) {
        console.error("Upload error", error);
        Alert.alert("Erro", "Falha ao enviar imagem, tente novamente");
      }
    }
  };

  useEffect(() => {
    // setReloadImage(reloadImage + 1);
    fetch("http://172.22.0.1:3000/users/getUserData", {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json() as Promise<UserData>)
      .then((data) => {
        console.log(data);
        
        // setUserData(data);
        saveUserData(data);
        setGender(data.gender ?? "");
        setSports(data.sport ?? "");
        setNameValue(data.full_name ?? "");
        setBioValue(data.bio ?? "");
        setUnmaskedValue(data.birthDate ?? "");
        // setImageUrl(data.avatar_url ?? "");
      });
  }, []);

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

  async function submitForm() {
    const result = await fetch("http://172.22.0.1:3000/users/edituserdata", {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        full_name: nameValue ? nameValue : null,
        bio: bioValue ? bioValue : null,
        birthDate: unMaskedValue ? unMaskedValue : null,
        gender: gender ? gender : null,
        sport: sports ? sports : null,
      }),
    });

    const data = await result.json();
    if (result.ok) {
      console.log("success", data);
    } else {
      console.log("error");
      throw new Error(data.message);
    }
  }

  const selectAvatar = () => {
    setModalVisible(false);
    pickImage();
  };

  async function deleteAvatar() {
    const result = await fetch(`http://172.22.0.1:3000/users/deleteavatar`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        filename: getUserData.avatar_url
      }),
    })

    const data = await result.json();
    console.log(data)
    if (result.ok) {
      console.log("success deleted", data);
      // setImageUrl("");
      saveUserData({ ...getUserData, avatar_url: "" });
      setModalVisible(false);
    } else {
      console.log("error");
      setModalVisible(false);
      throw new Error(data.message);
    }
  } 

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
                source={{ uri: `${getUserData.avatar_url}?t=${new Date().getTime()}` }}
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
            value={unMaskedValue}
            mask="99/99/9999"
            onChangeText={(text, rawText) => {
              setUnmaskedValue(rawText);
            }}
            className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
            keyboardType="numeric"
          />

          <Text className="font-inter-bold text-base mt-[23px]">
            Como você se identifica?
          </Text>
          

          <Text className="font-inter-bold text-base mt-[23px]">Esportes</Text>
          

          <TouchableOpacity
            onPress={submitForm}
            className="h-[52px] bg-bondis-green mt-8 rounded-full justify-center items-center"
          >
            <Text className="font-inter-bold text-base">Salvar alterações</Text>
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

              <TouchableOpacity onPress={deleteAvatar}>
                <Text className="text-center text-base pt-4  text-[#EB4335] ">
                  Remover foto
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


