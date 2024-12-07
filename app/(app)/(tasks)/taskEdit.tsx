import { useLocalSearchParams } from 'expo-router';
import {View, Text} from "react-native"

export default function TaskEdit() {
  const { taskId, participationId, desafioName } = useLocalSearchParams();
  
  <View>
    <Text>{taskId}</Text>
    <Text>{participationId}</Text>
    <Text>{desafioName}</Text>
  </View>

}
