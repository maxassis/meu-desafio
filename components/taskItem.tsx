import { View, Text, TouchableOpacity } from "react-native";
import Livre from "../assets/livre.svg";
import Calendar from "../assets/calendar.svg";
import Pin from "../assets/map-pin.svg";
import Gear from "../assets/settings-black.svg";
import Link from "../assets/link.svg";
import { useNavigation } from "@react-navigation/native";
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export interface TaskItemProps {
  id: number
  name: string
  environment: string
  date: Date | null
  duration: number
  calories: number
  local: string | null
  distanceKm: string
  inscriptionId: number
  usersId: string
}

export interface TaskListProps {
  task: TaskItemProps
  openModalEdit: (taskData: TaskItemProps) => void
}

export function convertSecondsToTimeString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

const timeSinceDate = (dateStr: string | Date): string => {
  const targetDate = dayjs(dateStr);
  if (!targetDate.isValid()) {
    throw new Error("Data inválida");
  }
  const currentDate = dayjs();
  const differenceInYears = currentDate.diff(targetDate, 'year');
  const differenceInMonths = currentDate.diff(targetDate, 'month');
  const differenceInDays = currentDate.diff(targetDate, 'day');
  if (differenceInYears >= 1) {
    return `Há ${differenceInYears} ano(s)`;
  } else if (differenceInMonths >= 1) {
    return differenceInMonths === 1 ? `Há 1 mês` : `Há ${differenceInMonths} meses`;
  } else {
    return differenceInDays === 1 ? `Há 1 dia` : `Há ${differenceInDays} dias`;
  }
};

export default function TaskItem({ task, openModalEdit }: TaskListProps) {
    const navigation = useNavigation<any>();

    return(
        <View className="h-[165px] p-5 bg-white mb-4">
          <View className="flex-row w-full h-[42px]">
            <View className="h-[42px] flex-row">
              <Livre />
              <View className="ml-4 ">
                <Text className="text-base font-inter-bold">
                  {task.name}
                </Text>
                <View className="flex-row">
                  <View className="flex-row gap-x-1 items-center justify-center">
                    <Calendar />
                    <Text className="text-bondis-gray-dark text-xs">
                    {timeSinceDate(task.date!)}
                    </Text>
                  </View>
                  <View className="flex-row gap-x-1 items-center justify-center ml-4">
                    {task.local && <Pin />}
                    <Text className="text-bondis-gray-dark text-xs ml-4">
                      {task.local}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => openModalEdit(task)} className="ml-auto w-[40px] h-[32px] items-end">
              <Gear />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-x-1 mt-3 none">
            <Link />
            <Text className="text-xs text-bondis-gray-dark">Cadastrado manualmente</Text>
          </View> 

          <View className="flex-row mt-3">
            <View className="w-[98px] h-[44px] border-l-2 border-[#D1D5DA] pl-2">
                <Text className="text-[18px] font-inter-bold">{task.distanceKm}</Text>
                <Text className="text-bondis-gray-dark text-[10px]">KM</Text>
            </View>
            <View className="w-[100px] h-[44px] border-l-2 border-[#D1D5DA] pl-2">
                <Text className="text-[18px] font-inter-bold">{ convertSecondsToTimeString(task.duration) }</Text>
                <Text className="text-bondis-gray-dark text-[10px]">DURAÇÃO</Text>
            </View>
            <View className="w-[98px] h-[44px] border-l-2 border-[#D1D5DA] pl-2">
                <Text className="text-[18px] font-inter-bold">{task.calories}</Text>
                <Text className="text-bondis-gray-dark text-[10px]">CAL</Text>
            </View>
          </View> 
        </View>
    )
}