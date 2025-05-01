import { create } from 'zustand';

interface Task {
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

interface DesafioStore {
  inscriptionId: number | null;
  desafioName: string | null;
  taskData: Task | null;
  distanceTotal: number;
  progress: number;
  desafioId: number | null;
  setDesafioData: (participationId: number, desafioName: string, progress: number, distanceTotal: number, desafioId: number) => void;
  setTaskData: (taskData: Task) => void;
  clearDesafioData: () => void;
  clearTaskData: () => void;
}

const useDesafioStore = create<DesafioStore>((set) => ({
  inscriptionId: null,
  desafioName: null,
  taskData: null,
  distance: 0,
  distanceTotal: 0,
  progress: 0,
  desafioId: null,
  setDesafioData: (inscriptionId, desafioName, progress ,distanceTotal, desafioId ) => 
    set({ inscriptionId, desafioName, progress ,distanceTotal, desafioId }),
  setTaskData: (taskData) =>
    set({ taskData }),
  clearDesafioData: () => 
    set({ inscriptionId: null, desafioName: null }),
  clearTaskData: () =>
    set({ taskData: null })
}));

export default useDesafioStore; 