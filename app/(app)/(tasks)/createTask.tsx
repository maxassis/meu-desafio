import { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Pressable,
  StatusBar
} from "react-native";
import KilometerMeterPicker, { KilometerMeterPickerModalRef } from "../../../components/distancePicker";
import Left from "../../../assets/arrow-left.svg";
import Outdoor from "../../../assets/Outdoor.svg";
import Indoor from "../../../assets/Indoor.svg";
import { LinearGradient } from "expo-linear-gradient";
import { cva } from "class-variance-authority";
import Down from "../../../assets/down.svg";
import tokenExists from "../../../store/auth-store";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { ptBR } from "../../../utils/localeCalendar";
import dayjs from 'dayjs';
import TimePickerModal, { TimePickerModalRef } from "../../../components/timePicker";
import { router } from 'expo-router';
import useDesafioStore from "../../../store/desafio-store";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

interface Distance {
  kilometers: number;
  meters: number;
}

export default function TaskCreate() {
  const [modalVisible, setModalVisible] = useState(false);
  const [ambience, setAmbience] = useState("livre");
  const [distance, setDistance] = useState<{
    kilometers: number;
    meters: number;
  }>({ kilometers: 0, meters: 0 });
  const [activityName, setActivityName] = useState("");
  const [calories, setCalories] = useState("");
  const [local, setLocal] = useState("");
  const [day, setDay] = useState<DateData>({
    year: 0,
    month: 0,
    day: 0,
    timestamp: 0,
    dateString: dayjs().format('YYYY-MM-DD')
  });
  const [calendar, setCalendarVisible] = useState(false);
  const [isModalTimeVisible, setModalTimeVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const token = tokenExists((state) => state.token);
  const { participationId, desafioName } = useDesafioStore();
  const childRef = useRef<KilometerMeterPickerModalRef>(null);
  const timePickerRef = useRef<TimePickerModalRef>(null);

  function closeModalDistance({ kilometers, meters }: Distance) {
    setDistance({ kilometers, meters });
    setModalVisible(false);
  }

  function closeModalTime(time: { hours: number, minutes: number, seconds: number }) {
    setSelectedTime(time);
    setModalTimeVisible(false);
  };

  const handleClearDistance = () => {
    if (childRef.current) {
      childRef.current.clearDistance();
    }
  };

  function createTask() { 
    fetch('http://10.0.2.2:3000/tasks/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
         "name": activityName,
         "distance": +`${distance.kilometers}.${distance.meters}`,
         "environment": ambience,
         "calories": +calories,
         "participationId": participationId,
         "date": !day ? formatDateToISO(dayjs().format('YYYY-MM-DD')) : formatDateToISO(day.dateString),
         "duration": convertTimeToHours(selectedTime),
       })
    })
    .then(response => response.json())
    .then(json => {      
      // console.log(json);
      
      router.push({
        pathname: '/taskList'});
      clearInputs()
    })
    .catch(error => console.error(error));
  }

  function clearInputs() {
    setActivityName("")
    setDistance({ kilometers: 0, meters: 0 });
    setAmbience("livre");
    setCalories("");
    setLocal("");
    handleClearDistance();
  }

  const formatDateToISO = (date: string) => {
    if (!date) return null;

    const [year, month, day] = date.split('-').map(Number);
    const isoDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); 
    const formattedDate = isoDate.toISOString().replace(/\.\d{3}Z$/, 'Z');
    return formattedDate;
  };

  function convertTimeToHours(time: { hours: number, minutes: number, seconds: number }): number {
    const { hours, minutes, seconds } = time;
    return hours + minutes / 60 + seconds / 3600;
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView
        className=" flex-1"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View className="mb-[10px] pt-[38px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-[43px] w-[43px] rounded-full bg-bondis-text-gray justify-center items-center"
          >
            <Left />
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-inter-bold mt-7">
          Como foi o sua atividade? 
        </Text>

        <Text className="font-inter-bold text-base mt-7">
          Nome da atividade
        </Text>

        <TextInput
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
          value={activityName}
          onChangeText={setActivityName}
        />

        { activityName.length === 0 &&
          <Text className="mt-1 text-bondis-alert-red">
              Campo obrigatório
          </Text>
        }

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
        <TouchableOpacity onPress={() => setCalendarVisible(true)} className="bg-bondis-text-gray rounded-[4px] h-[52px] flex-row mt-2 items-center justify-between pr-[22px] pl-4">
          <Text>{dayjs(day.dateString).format('DD/MM/YYYY')}</Text>
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
                    className="rounded-lg"
                    theme={{
                      todayTextColor: "#EB4335",
                      selectedDayTextColor: "black",
                      selectedDayBackgroundColor: "#12FF55",
                      arrowColor: "#12FF55",
                      textMonthFontWeight: "bold",
                    }}
                    onDayPress={(day: DateData) => {
                      setDay(day);
                      setCalendarVisible(false);
                    }}
                    markedDates={{ [day.dateString]: { selected: true } }}
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
          <Text>{ selectedTime.hours.toString().padStart(2, '0') + ':' + selectedTime.minutes.toString().padStart(2, '0') + ':' + selectedTime.seconds.toString().padStart(2, '0') } </Text>
          <Down />
        </TouchableOpacity>
        <TimePickerModal
        ref={timePickerRef}
        visible={isModalTimeVisible}
        onClose={closeModalTime}
        onlyClose={setModalTimeVisible}
        />
        { (selectedTime.hours === 0 && selectedTime.minutes === 0 && selectedTime.seconds === 0) &&
          <Text className="mt-1 text-bondis-alert-red">
              Campo obrigatório
          </Text>
        } 

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
        { (distance.kilometers == 0 && distance.meters == 0) &&
          <Text className="mt-1 text-bondis-alert-red">
              Campo obrigatório
          </Text>
        }  

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

        <TouchableOpacity onPress={() => createTask()} 
        className={buttonDisabled({
          intent: activityName == "" || (distance.kilometers == 0 && distance.meters == 0) || (selectedTime.hours === 0 && selectedTime.minutes === 0 && selectedTime.seconds === 0)  ? "disabled" : null ,
        })}
        disabled={activityName == "" || (distance.kilometers == 0 && distance.meters == 0) || (selectedTime.hours === 0 && selectedTime.minutes === 0 && selectedTime.seconds === 0 )}        
        >
          <Text className="font-inter-bold text-base">Cadastrar atividade</Text>
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

const buttonDisabled = cva("h-[52px] flex-row bg-bondis-green mt-8 mb-[32px] rounded-full justify-center items-center", {
  variants: {
    intent: {
      disabled: "opacity-50",
    },
  },
});