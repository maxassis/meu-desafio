import { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import KilometerMeterPicker, {
  KilometerMeterPickerModalRef,
} from "../../../components/distancePicker";
import { router } from "expo-router";
import Outdoor from "../../../assets/Outdoor.svg";
import Indoor from "../../../assets/Indoor.svg";
import { LinearGradient } from "expo-linear-gradient";
import { cva } from "class-variance-authority";
import Down from "../../../assets/down.svg";
import tokenExists from "../../../store/auth-store";
import Left from "../../../assets/Icon-left.svg";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { ptBR } from "../../../utils/localeCalendar";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import TimePickerModal, { TimePickerModalRef } from "../../../components/timePicker";
import useDesafioStore from "../../../store/desafio-store";
import { useMutation, useQueryClient } from '@tanstack/react-query';

dayjs.extend(utc);
LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

interface Distance {
  kilometers: number;
  meters: number;
}

interface DadosTarefa {
  name: string;
  distance: number;
  environment: string;
  calories: number;
  participationId: number;
  date: string | null;
  duration: number;
}

interface TaskUpdateResult {
  data: DadosTarefa
  metaAtingida: boolean;
}

export default function TaskEdit() {
  const [modalVisible, setModalVisible] = useState(false);
  const [ambience, setAmbience] = useState("livre");
  const [distance, setDistance] = useState<{
    kilometers: number;
    meters: number;
  }>({ kilometers: 0, meters: 0 });
  const [activityName, setActivityName] = useState("");
  const [calories, setCalories] = useState("");
  const [local, setLocal] = useState("");
  const token = tokenExists((state) => state.token);
  const { taskData, progress, distanceTotal, desafioId } = useDesafioStore(); // Adicionado progress e distanceTotal
  const [day, setDay] = useState<DateData>({} as DateData);
  const [calendar, setCalendarVisible] = useState(false);
  const [initialDate, setInitialDate] = useState<any>();
  const [isModalTimeVisible, setModalTimeVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const timePickerRef = useRef<TimePickerModalRef>(null);
  const childRef = useRef<KilometerMeterPickerModalRef>(null);
  const queryClient = useQueryClient();

  if (!taskData) {
    router.back();
    return null;
  }

  function closeModalDistance({ kilometers, meters }: Distance) {
    setDistance({ kilometers, meters });
    setModalVisible(false);
  }

  function closeModalTime(time: { hours: number, minutes: number, seconds: number }) {
    setSelectedTime(time);
    setModalTimeVisible(false);
  }

  const ChangeDistancePicker = () => {
    if (childRef.current && taskData?.distanceKm) {
      childRef.current.changeDistance(
        +taskData.distanceKm.split(".")[0],
        +taskData.distanceKm.split(".")[1]
          ? +taskData.distanceKm.split(".")[1]
          : 0
      );
    }
  };

  const ChangeTimePicker = () => {
    if (timePickerRef.current && taskData?.duration) {
      const timeFormated = convertHoursToTimeString(taskData.duration);
      const [h, m, s] = timeFormated.split(":").map(Number);
      setSelectedTime({ hours: h, minutes: m, seconds: s });
      timePickerRef.current.changeTime(h, m, s);
    }
  };

  function convertHoursToTimeString(totalHours: number): string {
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.round((((totalHours - hours) * 60) - minutes) * 60);
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  function convertTimeToHours(time: { hours: number, minutes: number, seconds: number }): number {
    const { hours, minutes, seconds } = time;
    return hours + minutes / 60 + seconds / 3600;
  }

  useEffect(() => {
    if (!taskData) return;
    setActivityName(taskData.name);
    setDistance({
      kilometers: +taskData.distanceKm.split(".")[0],
      meters: +taskData.distanceKm.split(".")[1]
        ? +taskData.distanceKm.split(".")[1]
        : 0,
    });
    setCalories(taskData.calories.toString());
    setLocal(taskData.local!);
    setAmbience(taskData.environment);
    ChangeDistancePicker();
    setInitialDate(formatDate(taskData.date + ""));
    initialDate && setDay({
      dateString: initialDate,
      day: +initialDate!.split("-")[2],
      month: +initialDate!.split("-")[1],
      year: +initialDate!.split("-")[0],
      timestamp: 0
    });
    ChangeTimePicker();
  }, [taskData]);

  const isDurationValid = selectedTime.hours > 0 || selectedTime.minutes > 0 || selectedTime.seconds > 0;

  const updateTaskMutation = useMutation<TaskUpdateResult, Error>({
    mutationFn: async () => {
      if (!taskData) throw new Error("Task data is missing");
      
      // Verifica se a soma da distância atinge ou ultrapassa a meta
      const distanciaSelecionada = +`${distance.kilometers}.${distance.meters}`;
      const distanciaAtual = progress || 0;
      const distanciaTotalAposAdicao = distanciaAtual + distanciaSelecionada;
      const metaAtingida = distanciaTotalAposAdicao >= distanceTotal;
      
      // Se a meta for atingida, exibe o alert e retorna uma Promise
      // que será resolvida apenas quando o usuário confirmar
      if (metaAtingida) {
        return new Promise((resolve, reject) => {
          Alert.alert(
            "Atenção",
            "Ao editar esta tarefa, você concluirá o desafio. Uma vez concluído, não será mais possível adicionar nem alterar mais tarefas.",
            [
              {
                text: "Cancelar",
                style: "cancel",
                onPress: () => reject(new Error("User cancelled")),
              },
              {
                text: "Concluir",
                onPress: async () => {
                  try {
                    const response = await fetch(`http://10.0.2.2:3000/tasks/update-task/${taskData.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        name: activityName,
                        distanceKm: +`${distance.kilometers}.${distance.meters}`,
                        environment: ambience,
                        date: initialDate ? formatDateToISO(initialDate) : formatDateToISO(day.dateString),
                        duration: convertTimeToHours(selectedTime),
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error("Failed to update task");
                    }
                    
                    // Limpa o cache de desafios
                    queryClient.invalidateQueries({ queryKey: ["desafios"]});
                    queryClient.invalidateQueries({ queryKey: ["routeData", desafioId]});
                    queryClient.invalidateQueries({ queryKey: ["getAllDesafios"]});
                    queryClient.invalidateQueries({ queryKey: ["rankData", desafioId]});
                    
                    // Resolve a Promise com os dados e um flag indicando que a meta foi atingida
                    const responseData = await response.json();
                    resolve({ 
                      data: responseData, 
                      metaAtingida: true 
                    });
                  } catch (error) {
                    reject(error);
                  }
                },
              },
            ],
            { cancelable: true }
          );
        });
      }
      
      // Caso a meta não seja atingida, atualiza normalmente
      const response = await fetch(`http://10.0.2.2:3000/tasks/update-task/${taskData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: activityName,
          distanceKm: +`${distance.kilometers}.${distance.meters}`,
          environment: ambience,
          date: initialDate ? formatDateToISO(initialDate) : formatDateToISO(day.dateString),
          duration: convertTimeToHours(selectedTime),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      const responseData = await response.json();
      return { 
        data: responseData, 
        metaAtingida: false 
      };
    },
    
    onSuccess: (result) => {
      // Verifica se a meta foi atingida pelo resultado
      if (result.metaAtingida) {
        // Se a meta foi atingida, navega para o dashboard
        router.push("/dashboard");
      } else {
        // Se a meta não foi atingida, navega para a lista de tarefas
        router.push("/taskList");
      }
    },
    
    onError: (error) => {
      // Não precisa mostrar erro se o usuário cancelou a operação
      if (error.message !== "User cancelled") {
        console.error("Error updating task:", error);
      }
    },
  });


  const formatDateToISO = (date: string) => {
    if (!date) return null;
    const [year, month, day] = date.split('-').map(Number);
    const isoDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const formattedDate = isoDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
    return formattedDate;
  };

  function formatDate(isoDate: string): string {
    const date = dayjs(isoDate).utc();
    return date.format('YYYY-MM-DD');
  }

  const isFormValid =
    activityName !== "" &&
    (distance.kilometers > 0 || distance.meters > 0) &&
    isDurationValid;

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View className="flex-row items-end h-[86px] pb-[14px]">
          <TouchableOpacity onPress={() => router.back()}>
            <Left />
          </TouchableOpacity>
          <Text className="text-base font-inter-bold mx-auto">
            Editar atividade
          </Text>
        </View>
        <Text className="font-inter-bold text-base mt-7">Nome</Text>
        <TextInput
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
          value={activityName}
          onChangeText={setActivityName}
        />
        {activityName.length === 0 && (
          <Text className="mt-1 text-bondis-alert-red">Campo obrigatório</Text>
        )}
        <Text className="font-inter-bold mt-7 text-base">Ambiente</Text>
        <View className="flex-row mt-4 gap-x-4 ml-[-8px]">
          <TouchableOpacity onPress={() => setAmbience("livre")}>
            <LinearGradient
              colors={[
                ambience === "livre" ? "rgba(178, 255, 115, 0.322)" : "#fff",
                ambience === "livre" ? "#12FF55" : "#fff",
              ]}
              className={ambienceType({
                intent: ambience === "livre" ? "livre" : null,
              })}
            >
              <Outdoor />
              <Text>Ao ar livre</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAmbience("esteira")}>
            <LinearGradient
              colors={[
                ambience === "esteira" ? "rgba(178, 255, 115, 0.322)" : "#fff",
                ambience === "esteira" ? "#12FF55" : "#fff",
              ]}
              className={ambienceType({
                intent: ambience === "esteira" ? "esteira" : null,
              })}
            >
              <Indoor />
              <Text>Esteira</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text className="font-inter-bold text-base mt-7">Data</Text>
        <TouchableOpacity
          onPress={() => setCalendarVisible(true)}
          className="bg-bondis-text-gray rounded-[4px] h-[52px] flex-row mt-2 items-center justify-between pr-[22px] pl-4"
        >
          <Text>{initialDate ? dayjs(initialDate).format('DD/MM/YYYY') : dayjs(day.dateString).format('DD/MM/YYYY')}</Text>
          <Down />
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={calendar}
          onRequestClose={() => setCalendarVisible(false)}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setCalendarVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black/50">
              <Pressable>
                <View className="bg-white p-6 rounded-lg shadow-lg w-80">
                  <Calendar
                    maxDate={new Date().toISOString().split('T')[0]}
                    current=""
                    className="rounded-lg"
                    theme={{
                      todayTextColor: "#EB4335",
                      selectedDayTextColor: "black",
                      selectedDayBackgroundColor: "#12FF55",
                      arrowColor: "#12FF55",
                      textMonthFontWeight: "bold",
                    }}
                    onDayPress={(day: DateData) => {
                      setInitialDate("")
                      setDay(day);
                      setCalendarVisible(false);
                    }}
                    markedDates={{ [initialDate ? initialDate : day.dateString]: { selected: true } }}
                  />
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
        <Text className="font-inter-bold text-base mt-7">
          Duração da atividade
        </Text>
        <TouchableOpacity onPress={() => setModalTimeVisible(true)} className="bg-bondis-text-gray rounded-[4px] h-[52px] flex-row mt-2 items-center justify-between pr-[22px] pl-4">
          <Text>{convertHoursToTimeString(convertTimeToHours(selectedTime))}</Text>
          <Down />
        </TouchableOpacity>
        {!isDurationValid && (
          <Text className="mt-1 text-bondis-alert-red">Campo obrigatório</Text>
        )}
        <TimePickerModal
          ref={timePickerRef}
          visible={isModalTimeVisible}
          onClose={closeModalTime}
          onlyClose={setModalTimeVisible}
        />
        <Text className="font-inter-bold text-base mt-7">
          Distancia percorrida
        </Text>
        <KilometerMeterPicker
          ref={childRef}
          visible={modalVisible}
          onClose={({ kilometers, meters }: Distance) =>
            closeModalDistance({ kilometers, meters })
          }
          onlyClose={setModalVisible}
        />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 flex-row justify-between items-center pl-4 pr-[22px]"
        >
          <Text>
            {distance.kilometers}km {distance.meters}m
          </Text>
          <Down />
        </TouchableOpacity>
        {distance.kilometers === 0 && distance.meters === 0 && (
          <Text className="mt-1 text-bondis-alert-red">Campo obrigatório</Text>
        )}
        <Text className="font-inter-bold text-base mt-7">
          Calorias queimadas
        </Text>
        <TextInput
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 items-end justify-center pr-[22px] pl-4"
        />
        <Text className="font-inter-bold text-base mt-7">Local</Text>
        <TextInput
          value={local}
          onChangeText={setLocal}
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 items-end justify-center pr-[22px] pl-4"
        />
        <TouchableOpacity
          onPress={() => updateTaskMutation.mutate()}
          className={buttonDisabled({
            intent: !isFormValid || updateTaskMutation.isPending ? "disabled" : null,
          })}
          disabled={!isFormValid || updateTaskMutation.isPending}
        >
          {updateTaskMutation.isPending ? (
            <View className="flex-row items-center gap-x-2">
              <Text className="font-inter-bold text-base ml-2">Carregando...</Text>
              <ActivityIndicator color="#000000" size="small" />
            </View>
          ) : (
            <Text className="font-inter-bold text-base">Cadastrar atividade</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
    </SafeAreaView>
  );
}

const ambienceType = cva(
  "h-[37px] rounded-full justify-center items-center flex-row gap-x-[8px] border-[1px] border-[#D9D9D9] pr-4 pl-2",
  {
    variants: {
      intent: {
        livre: "border-0",
        esteira: "border-0",
      },
    },
  }
);

const buttonDisabled = cva(
  "h-[52px] flex-row bg-bondis-green mt-8 mb-[32px] rounded-full justify-center items-center",
  {
    variants: {
      intent: {
        disabled: "opacity-50",
      },
    },
  }
);