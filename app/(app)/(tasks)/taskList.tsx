// import { useLocalSearchParams } from 'expo-router';
// import { Text, View } from 'react-native';

// export default function TaskList() {
//   const { participationId, desafioName } = useLocalSearchParams();

//   console.log(participationId, desafioName); // Verifique os valores recebidos no console.

//   return (
//     <View>
//       <Text>Tarefa relacionada ao desafio: {desafioName ?? "hehehe"}</Text>
//       <Text>ID de participação: {participationId ?? "dsadasdd"}</Text>
//     </View>
//   );
// }


import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useLocalSearchParams } from 'expo-router';
import tokenExists from "../../../store/auth-store";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Left from "../../../assets/Icon-left.svg";
import TaskItem from "../../../components/taskItem";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Plus from "../../../assets/plus.svg";

export type TasksData = Data[];
export interface Data {
  id: number;
  name: string;
  environment: string;
  date: null | Date;
  duration: null | string;
  calories: number;
  local: null | string;
  distanceKm: string;
  participationId: number;
  usersId: string;
}

export default function TaskList({ route }: any) {
  const { participationId, desafioName } = useLocalSearchParams();
  const navigation = useNavigation<any>();
  const token = tokenExists((state) => state.token);
  const [data, setData] = useState<TasksData>();
  const [task, setTask] = useState<Data>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetEditRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const snapPointsEdit = useMemo(() => ["20%"], []);

  const fetchTasks = useCallback(() => {
    fetch(`http://192.168.1.18:3000/tasks/get-tasks/${participationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json() as Promise<TasksData>)
      .then((data) => {
        setData(data);
      })
      .catch((error) => console.error(error));
  }, [participationId, token]);

  function deleteTask(id: number) {
    Alert.alert(
      "Confirmação de Exclusão", 
      "Tem certeza que deseja excluir esta tarefa?",
      [
        {
          text: "Cancelar",
          style: "cancel", 
        },
        {
          text: "Excluir",
          style: "destructive", 
          onPress: () => {
            fetch(`http://192.168.1.18:3000/tasks/delete-task/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                bottomSheetEditRef.current?.close()
                return response.json();
              })
              .then((json) => {
                console.log("Task deleted:", json);
                fetchTasks(); 
              })
              .catch((error) => {
                console.error("Failed to delete the task:", error);
                Alert.alert("Erro ao excluir tarefa", "", [
                  {
                    text: "Ok",
                    style: "cancel",
                  }
                ])
              });
          },
        },
      ],
      { cancelable: true } // O alerta pode ser cancelado ao tocar fora dele
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  function openModalEdit(taskData: Data) {
    setTask(taskData);
    bottomSheetEditRef.current?.expand()
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView overScrollMode="never" className="bg-[#F1F1F1] flex-1 ">
        <View className="bg-white mb-7">
          <View className="flex-row mt-[49.5] px-5 bg-white">
            <TouchableOpacity className="w-[30px] h-[30px]" onPress={() => navigation.navigate("DesafioSelect")} >
              <Left />
            </TouchableOpacity>
            <Text className="text-base font-inter-bold mx-auto ">
              Atividades recentes
            </Text>
          </View>

          <View className="h-[60px] mt-4 pt-2 px-5 mb-7 bg-white">
            <Text className="text-sm text-bondis-gray-secondary">Desafio</Text>
            <Text className="text-base font-inter-bold mt-2">
              {desafioName}
            </Text>
          </View>
        </View>

        {data && data.map((task) => (
             <TaskItem task={task} key={task.id} openModalEdit={openModalEdit} />
        ))}

      </ScrollView>

      <TouchableOpacity
          onPress={() => bottomSheetRef.current?.expand()}
          className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-4 bottom-6"
        >
          <Plus />
        </TouchableOpacity>

        <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
      >
        <BottomSheetView className="flex-1">
          <Text className="font-inter-bold mt-[10px] text-base mx-5 mb-4">
            Adicione um atividade
          </Text>
          <View className="mx-5">
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Via Strava</Text>
            </View>
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Via Apple Saúde</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("TaskCreate", { participationId, desafioName })}  className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Cadastrar manualmente</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetEditRef}
        snapPoints={snapPointsEdit}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderRadius: 20,
        }}
      >
        <BottomSheetView className="flex-1">
          <View className="mx-5">
            <TouchableOpacity onPress={() => { navigation.navigate("TaskEdit", { participationId: participationId, taskData: task, desafioName }); bottomSheetEditRef.current?.close()}} 
            className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Editar atividade</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(task!.id)} className="h-[51px] justify-center items-center">
              <Text className="text-bondis-alert-red">Excluir atividade</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>  

    </SafeAreaView>
  );
}