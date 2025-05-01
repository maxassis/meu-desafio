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
  StatusBar,
  ActivityIndicator,
  Alert
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
import { useMutation, useQueryClient } from '@tanstack/react-query';

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

interface Distancia {
  kilometers: number;
  meters: number;
}

interface DadosTarefa {
  name: string;
  distance: number;
  environment: string;
  calories: number;
  inscriptionId: number;
  date: string | null;
  duration: number;
}

export default function TaskCreate() {
  const [modalVisible, setModalVisible] = useState(false);
  const [ambiente, setAmbiente] = useState("livre");
  const [distancia, setDistancia] = useState<{
    kilometers: number;
    meters: number;
  }>({ kilometers: 0, meters: 0 });
  const [nomeAtividade, setNomeAtividade] = useState("");
  const [calorias, setCalorias] = useState("");
  const [local, setLocal] = useState("");
  const [dia, setDia] = useState<DateData>({
    year: 0,
    month: 0,
    day: 0,
    timestamp: 0,
    dateString: dayjs().format('YYYY-MM-DD')
  });
  const [calendario, setCalendarioVisible] = useState(false);
  const [isModalTempoVisible, setModalTempoVisible] = useState(false);
  const [tempoSelecionado, setTempoSelecionado] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const token = tokenExists((state) => state.token);
  const { inscriptionId, progress, distanceTotal, desafioId } = useDesafioStore();
  const childRef = useRef<KilometerMeterPickerModalRef>(null);
  const timePickerRef = useRef<TimePickerModalRef>(null);
  const queryClient = useQueryClient();

  const criarTarefaMutation = useMutation({
    mutationFn: async (dadosTarefa: DadosTarefa) => {
      const response = await fetch('http://10.0.2.2:3000/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosTarefa)
      });
      if (!response.ok) {
        const dadosErro = await response.json();
        throw new Error(dadosErro.message || 'Falha ao criar tarefa');
      }
      return response.json();
    },
    onSuccess: (data) => {
      limparInputs();
      queryClient.invalidateQueries({ queryKey: ["desafios"]});
      queryClient.invalidateQueries({ queryKey: ["routeData", desafioId]});
      queryClient.invalidateQueries({ queryKey: ["getAllDesafios"]});
      queryClient.invalidateQueries({ queryKey: ["rankData", desafioId]});
      
      const distanciaSelecionada = +`${distancia.kilometers}.${distancia.meters}`;
      const distanciaAtual = progress || 0;
      const distanciaTotalAposAdicao = distanciaAtual + distanciaSelecionada;
      const metaAtingida = distanciaTotalAposAdicao >= distanceTotal;

      if (metaAtingida) {
        router.push({
          pathname: '/dashboard'
        });
      } else {
        router.push({
          pathname: '/taskList'
        });
      }
    },
    onError: (erro) => {
      console.error('Erro ao criar tarefa:', erro);
    }
  });

  function fecharModalDistancia({ kilometers, meters }: Distancia) {
    setDistancia({ kilometers, meters });
    setModalVisible(false);
  }

  function fecharModalTempo(tempo: { hours: number, minutes: number, seconds: number }) {
    setTempoSelecionado(tempo);
    setModalTempoVisible(false);
  };

  const limparDistancia = () => {
    if (childRef.current) {
      childRef.current.clearDistance();
    }
  };

  function criarTarefa() {
    const distanciaSelecionada = +`${distancia.kilometers}.${distancia.meters}`;
    
    const distanciaAtual = progress || 0;
    const distanciaTotalAposAdicao = distanciaAtual + distanciaSelecionada;
    const metaAtingida = distanciaTotalAposAdicao >= distanceTotal;
     
    if(metaAtingida) {
      Alert.alert(
        "Atenção",
        "Ao adicionar esta tarefa, você concluirá o desafio. Uma vez concluído, não será mais possível adicionar nem alterar mais tarefas.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Concluir",
            onPress: () => {
              const dadosTarefa: DadosTarefa = {
                name: nomeAtividade,
                distance: distanciaSelecionada,
                environment: ambiente,
                calories: +calorias,
                inscriptionId: inscriptionId!,
                date: !dia ? formatarDataParaISO(dayjs().format('YYYY-MM-DD')) : formatarDataParaISO(dia.dateString),
                duration: converterTempoParaHoras(tempoSelecionado),
              };

              criarTarefaMutation.mutate(dadosTarefa);              
            }
          }
        ],
        { cancelable: true }
      );
      return;
    }
    
    const dadosTarefa: DadosTarefa = {
      name: nomeAtividade,
      distance: distanciaSelecionada,
      environment: ambiente,
      calories: +calorias,
      inscriptionId: inscriptionId!,
      date: !dia ? formatarDataParaISO(dayjs().format('YYYY-MM-DD')) : formatarDataParaISO(dia.dateString),
      duration: converterTempoParaHoras(tempoSelecionado),
    };
    
    criarTarefaMutation.mutate(dadosTarefa);
  }
  

  function limparInputs() {
    setNomeAtividade("");
    setDistancia({ kilometers: 0, meters: 0 });
    setAmbiente("livre");
    setCalorias("");
    setLocal("");
    limparDistancia();
  }

  const formatarDataParaISO = (data: string) => {
    if (!data) return null;
    return dayjs(data).toISOString();
  };

  function converterTempoParaHoras(tempo: { hours: number, minutes: number, seconds: number }): number {
    const { hours, minutes, seconds } = tempo;
    return hours + minutes / 60 + seconds / 3600;
  }

  const formularioValido = nomeAtividade !== "" && 
    (distancia.kilometers > 0 || distancia.meters > 0) && 
    (tempoSelecionado.hours > 0 || tempoSelecionado.minutes > 0 || tempoSelecionado.seconds > 0);

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView
        className="flex-1"
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
          Como foi a sua atividade? 
        </Text>

        <Text className="font-inter-bold text-base mt-7">
          Nome da atividade
        </Text>

        <TextInput
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 pl-4"
          value={nomeAtividade}
          onChangeText={setNomeAtividade}
        />

        { nomeAtividade.length === 0 &&
          <Text className="mt-1 text-bondis-alert-red">
              Campo obrigatório
          </Text>
        }

        <Text className="font-inter-bold mt-7 text-base">Ambiente</Text>
        <View className="flex-row mt-4 gap-x-4 ml-[-8px]">
          <TouchableOpacity onPress={() => setAmbiente("livre")}>
            <LinearGradient
              colors={[
                ambiente === "livre" ? "rgba(178, 255, 115, 0.322)" : "#fff",
                ambiente === "livre" ? "#12FF55" : "#fff",
              ]}
              className={tipoAmbiente({
                intent: ambiente === "livre" ? "livre" : null,
              })}
            >
              <Outdoor />
              <Text>Ao ar livre</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAmbiente("esteira")}>
            <LinearGradient
              colors={[
                ambiente === "esteira" ? "rgba(178, 255, 115, 0.322)" : "#fff",
                ambiente === "esteira" ? "#12FF55" : "#fff",
              ]}
              className={tipoAmbiente({
                intent: ambiente === "esteira" ? "esteira" : null,
              })}
            >
              <Indoor />
              <Text>Esteira</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text className="font-inter-bold text-base mt-7">Data</Text>
        <TouchableOpacity onPress={() => setCalendarioVisible(true)} className="bg-bondis-text-gray rounded-[4px] h-[52px] flex-row mt-2 items-center justify-between pr-[22px] pl-4">
          <Text>{dayjs(dia.dateString).format('DD/MM/YYYY')}</Text>
          <Down />
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={calendario}
          onRequestClose={() => setCalendarioVisible(false)}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setCalendarioVisible(false)}>
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
                    onDayPress={(dia: DateData) => {
                      setDia(dia);
                      setCalendarioVisible(false);
                    }}
                    markedDates={{ [dia.dateString]: { selected: true } }}
                  />
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <Text className="font-inter-bold text-base mt-7">
          Duração da atividade
        </Text>
        <TouchableOpacity onPress={() => setModalTempoVisible(true)} className="bg-bondis-text-gray rounded-[4px] h-[52px] flex-row mt-2 items-center justify-between pr-[22px] pl-4">
          <Text>{ tempoSelecionado.hours.toString().padStart(2, '0') + ':' + tempoSelecionado.minutes.toString().padStart(2, '0') + ':' + tempoSelecionado.seconds.toString().padStart(2, '0') } </Text>
          <Down />
        </TouchableOpacity>
        <TimePickerModal
        ref={timePickerRef}
        visible={isModalTempoVisible}
        onClose={fecharModalTempo}
        onlyClose={setModalTempoVisible}
        />
        { (tempoSelecionado.hours === 0 && tempoSelecionado.minutes === 0 && tempoSelecionado.seconds === 0) &&
          <Text className="mt-1 text-bondis-alert-red">
              Campo obrigatório
          </Text>
        } 

        <Text className="font-inter-bold text-base mt-7">
          Distância percorrida
        </Text>

        <KilometerMeterPicker
          ref={childRef}
          visible={modalVisible}
          onClose={({ kilometers, meters }: Distancia) =>
            fecharModalDistancia({ kilometers, meters })
          }
          onlyClose={setModalVisible}
        />
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-bondis-text-gray rounded-[4px] h-[52px] mt-2 flex-row justify-between items-center pl-4 pr-[22px]"
        >
          <Text>
            {distancia.kilometers}km {distancia.meters}m
          </Text>
          <Down />
        </TouchableOpacity>
        { (distancia.kilometers == 0 && distancia.meters == 0) &&
          <Text className="mt-1 text-bondis-alert-red">
              Campo obrigatório
          </Text>
        }  

        <Text className="font-inter-bold text-base mt-7">
          Calorias queimadas
        </Text>
        <TextInput
          value={calorias}
          onChangeText={setCalorias}
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
          onPress={() => criarTarefa()} 
          className={botaoDesabilitado({
            intent: !formularioValido || criarTarefaMutation.isPending ? "disabled" : null,
          })}
          disabled={!formularioValido || criarTarefaMutation.isPending}        
        >
          {criarTarefaMutation.isPending ? (
            <View className="flex-row items-center gap-x-2">
              <Text className="font-inter-bold text-base">Carregando...</Text>
              <ActivityIndicator color="#000000" />
            </View>
          ) : (
            <Text className="font-inter-bold text-base">Cadastrar atividade</Text>
          )}
        </TouchableOpacity>

        {criarTarefaMutation.isError && (
          <Text className="text-bondis-alert-red font-inter-medium text-center mb-4">
            Erro ao cadastrar atividade. Tente novamente.
          </Text>
        )}
      </ScrollView>
      <StatusBar backgroundColor="#000" barStyle="light-content" translucent={false} />
    </SafeAreaView>
  );
}

const tipoAmbiente = cva(
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

const botaoDesabilitado = cva("h-[52px] flex-row bg-bondis-green mt-8 mb-[32px] rounded-full justify-center items-center", {
  variants: {
    intent: {
      disabled: "opacity-50",
    },
  },
});