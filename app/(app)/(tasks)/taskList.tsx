import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function TaskList() {
  const { participationId, desafioName } = useLocalSearchParams();

  console.log(participationId, desafioName); // Verifique os valores recebidos no console.

  return (
    <View>
      <Text>Tarefa relacionada ao desafio: {desafioName ?? "hehehe"}</Text>
      <Text>ID de participação: {participationId ?? "dsadasdd"}</Text>
    </View>
  );
}