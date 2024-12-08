import { View, Text } from "react-native";
import useDesafioStore from "../../../store/desafio-store";

export default function TaskEdit() {
  const { participationId, desafioName, task } = useDesafioStore();
  
  return (
    <View>
      <Text>heheheehehehe!!!!!!</Text>
      <Text>Desafio: {desafioName}</Text>
      <Text>Atividade: {participationId}</Text>
      <Text>Distância: {JSON.stringify(task)}km</Text>
    </View>
  );
}
