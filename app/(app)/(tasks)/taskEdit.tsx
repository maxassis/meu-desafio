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

dayjs.extend(utc);

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

interface Distance {
  kilometers: number;
  meters: number;
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
  const { taskData } = useDesafioStore();
  const [day, setDay] = useState<DateData>({} as DateData);
  const [calendar, setCalendarVisible] = useState(false);
  const [initialDate, setInitialDate] = useState<any>();
  const [isModalTimeVisible, setModalTimeVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const timePickerRef = useRef<TimePickerModalRef>(null)
  const childRef = useRef<KilometerMeterPickerModalRef>(null);

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
  };

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
      const timeFormated = convertISOToTime(taskData.duration)
      timePickerRef.current.changeTime(
        +timeFormated.split(":")[0].padStart(2, '0'), 
        +timeFormated.split(":")[1].padStart(2, '0'), 
        +timeFormated.split(":")[2].padStart(2, '0')
      );
    }
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
    const timeFormated = convertISOToTime(taskData.duration!);
    setSelectedTime({ 
      hours: +timeFormated.split(":")[0], 
      minutes: +timeFormated.split(":")[1], 
      seconds: +timeFormated.split(":")[2] 
    });
    ChangeTimePicker();
  }, [taskData]);

  function updateTaskData() {
    if (!taskData) return;

    fetch(`http://192.168.1.18:3000/tasks/update-task/${taskData.id}`, {
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
        duration: convertTimeToISO(selectedTime.hours.toString().padStart(2, '0') + ':' + selectedTime.minutes.toString().padStart(2, '0') + ':' + selectedTime.seconds.toString().padStart(2, '0')),
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        router.push("/taskList");
      })
      .catch((error) => console.error(error));
  }

  const formatDateToISO = (date: string) => {
    if (!date) return null;

    const [year, month, day] = date.split('-').map(Number);
    const isoDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); 
    const formattedDate = isoDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
    return formattedDate;
  };

  function convertISOToTime(isoString: string): string {
    const date = new Date(isoString);  
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  }

  function convertTimeToISO(time: string): string {
    const currentDate = new Date();  
    const [hours, minutes, seconds] = time.split(':').map(Number);  
    currentDate.setUTCHours(hours, minutes, seconds, 0);
  
    return currentDate.toISOString();
  }

  function formatDate(isoDate: string): string {
    const date = dayjs(isoDate).utc(); // Apenas converter para UTC sem ajuste adicional

    return date.format('YYYY-MM-DD');
}

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView
        className=" flex-1"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View className="flex-row items-end h-[86px] pb-[14px]">
          <TouchableOpacity onPress={() => router.back()}>
            <Left />
          </TouchableOpacity>
          <Text className="text-base font-inter-bold mx-auto ">
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
          <Text>{initialDate ? dayjs(initialDate).format('DD/MM/YYYY') : dayjs(day.dateString).format('DD/MM/YYYY') }</Text>
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
          <Text>{ selectedTime.hours.toString().padStart(2, '0') + ':' + selectedTime.minutes.toString().padStart(2, '0') + ':' + selectedTime.seconds.toString().padStart(2, '0') }</Text>
          <Down />
        </TouchableOpacity>
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
        {distance.kilometers == 0 && distance.meters == 0 && (
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
          onPress={() => updateTaskData()}
          className={buttonDisabled({
            intent:
              activityName == "" ||
              (distance.kilometers == 0 && distance.meters == 0)
                ? "disabled"
                : null,
          })}
          disabled={
            activityName == "" ||
            (distance.kilometers == 0 && distance.meters == 0)
          }
        >
          <Text className="font-inter-bold text-base">Cadastrar atividade</Text>
        </TouchableOpacity>
      </ScrollView>
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
