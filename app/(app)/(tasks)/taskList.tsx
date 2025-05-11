import { useState, useRef, useMemo } from "react";
import tokenExists from "../../../store/auth-store";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Left from "../../../assets/Icon-left.svg";
import TaskItem from "../../../components/taskItem";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Plus from "../../../assets/plus.svg";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useDesafioStore from "../../../store/desafio-store";

export type TasksData = Data[];
export interface Data {
  id: number;
  name: string;
  environment: string;
  date: null | Date;
  duration: number;
  calories: number;
  local: null | string;
  distanceKm: string;
  inscriptionId: number;
  usersId: string;
}

const fetchTasks = async (
  inscriptionId: number,
  token: string
): Promise<TasksData> => {
  const response = await fetch(
    `http://10.0.2.2:3000/tasks/get-tasks/${inscriptionId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

const deleteTaskApi = async (id: number, token: string) => {
  const response = await fetch(`http://10.0.2.2:3000/tasks/delete-task/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function TaskList() {
  const {
    inscriptionId,
    desafioName,
    setTaskData,
    desafioId,
  } = useDesafioStore(); // Certifique-se de que 'id' esteja no store
  const token = tokenExists((state) => state.token);
  const [task, setTask] = useState<Data>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetEditRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const snapPointsEdit = useMemo(() => ["20%"], []);
  const queryClient = useQueryClient();
  const { origin } = useLocalSearchParams();

  // Query para buscar as tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", inscriptionId],
    queryFn: () => fetchTasks(inscriptionId as number, token!),
  });

  // Mutation para deletar task
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTaskApi(id, token!),
    onSuccess: () => {
      // Invalida todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["tasks", inscriptionId] });
      queryClient.invalidateQueries({ queryKey: ["desafios"] });
      queryClient.invalidateQueries({ queryKey: ["routeData", desafioId] });
      queryClient.refetchQueries({ queryKey: ["getAllDesafios"] });
      queryClient.invalidateQueries({ queryKey: ["rankData", desafioId] });

      bottomSheetEditRef.current?.close();
    },
    onError: (error) => {
      Alert.alert("Erro ao excluir tarefa", "", [
        {
          text: "Ok",
          style: "cancel",
        },
      ]);
    },
  });

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
          onPress: () => deleteMutation.mutate(id),
        },
      ],
      { cancelable: true }
    );
  }

  function openModalEdit(taskData: Data) {
    setTask(taskData);
    bottomSheetEditRef.current?.expand();
  }

  function toNextPage() {
    router.replace("/map");
    // if (origin === "map") {
    //   router.replace("/map");
    // } else {
    //   router.replace("/createTask");
    // }
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView overScrollMode="never" className="bg-[#F1F1F1] flex-1 ">
        <View className="bg-white mb-7">
          <View className="flex-row mt-[49.5] px-5 bg-white">
            <TouchableOpacity
              className="w-[30px] h-[30px]"
              onPress={() => toNextPage()}
            >
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

        {isLoading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#12FF55" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text>Erro ao carregar tarefas</Text>
          </View>
        ) : (
          data &&
          data.map((task) => (
            <TaskItem task={task} key={task.id} openModalEdit={openModalEdit} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => bottomSheetRef.current?.expand()}
        className="rounded-full bg-bondis-green absolute w-16 h-16 justify-center items-center right-4 bottom-6"
      >
        <Plus />
      </TouchableOpacity>

      {/* Bottom Sheet para adicionar atividade */}
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
            Adicione uma atividade
          </Text>
          <View className="mx-5">
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Via Strava</Text>
            </View>
            <View className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400">
              <Text>Via Apple Saúde</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (task) {
                  setTaskData(task);
                }
                router.push("/createTask");
                bottomSheetRef.current?.close();
              }}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
              <Text>Cadastrar manualmente</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Bottom Sheet para editar/excluir */}
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
            <TouchableOpacity
              onPress={() => {
                if (task) {
                  setTaskData(task);
                  router.push("/taskEdit");
                  bottomSheetEditRef.current?.close();
                }
              }}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
              <Text>Editar atividade</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteTask(task!.id)}
              className="h-[51px] justify-center items-center"
            >
              <Text className="text-bondis-alert-red">Excluir atividade</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
        translucent={false}
      />
    </SafeAreaView>
  );
}
