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
  setDesafioData: (participationId: number, desafioName: string, progress: number, distanceTotal: number) => void;
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
  setDesafioData: (inscriptionId, desafioName, progress ,distanceTotal ) => 
    set({ inscriptionId, desafioName, progress ,distanceTotal }),
  setTaskData: (taskData) =>
    set({ taskData }),
  clearDesafioData: () => 
    set({ inscriptionId: null, desafioName: null }),
  clearTaskData: () =>
    set({ taskData: null })
}));

export default useDesafioStore; 