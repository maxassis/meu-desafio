import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import tokenExists from "../../../store/auth-store";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import Left from "../../../assets/Icon-left.svg";
import TaskItem from "../../../components/taskItem";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Plus from "../../../assets/plus.svg";
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useDesafioStore from "../../../store/desafio-store";

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

const fetchTasks = async (participationId: number, token: string): Promise<TasksData> => {
  const response = await fetch(`https://bondis-app-backend.onrender.com/tasks/get-tasks/${participationId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

const deleteTaskApi = async (id: number, token: string) => {
  const response = await fetch(`https://bondis-app-backend.onrender.com/tasks/delete-task/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function TaskList() {
  const { participationId, desafioName, setTaskData } = useDesafioStore();
  const token = tokenExists((state) => state.token);
  const [task, setTask] = useState<Data>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetEditRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const snapPointsEdit = useMemo(() => ["20%"], []);
  const queryClient = useQueryClient();

  // Query para buscar as tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', participationId],
    queryFn: () => fetchTasks(participationId as number, token! ),
  });

  // Mutation para deletar task
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTaskApi(id, token!),
    onSuccess: () => {
      // Invalida e refaz a query das tasks após deletar
      queryClient.invalidateQueries({ queryKey: ['tasks', participationId] });
      bottomSheetEditRef.current?.close();
    },
    onError: (error) => {
      Alert.alert("Erro ao excluir tarefa", "", [
        {
          text: "Ok",
          style: "cancel",
        }
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
    bottomSheetEditRef.current?.expand()
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView overScrollMode="never" className="bg-[#F1F1F1] flex-1 ">
        <View className="bg-white mb-7">
          <View className="flex-row mt-[49.5] px-5 bg-white">
            <TouchableOpacity 
              className="w-[30px] h-[30px]" 
              onPress={() => router.push('/desafios')}
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
          data && data.map((task) => (
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
            <TouchableOpacity 
              onPress={() => {
                if (task) {
                  setTaskData(task);
                }
                router.push("/taskEdit");
                bottomSheetRef.current?.close();
              }}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
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
            <TouchableOpacity 
              onPress={() => { 
                if (task) {
                  setTaskData(task);
                  router.push('/taskEdit');
                  bottomSheetEditRef.current?.close();
                }
              }}
              className="h-[51px] justify-center items-center border-b-[0.2px] border-b-gray-400"
            >
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