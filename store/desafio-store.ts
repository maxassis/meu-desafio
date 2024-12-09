import { create } from 'zustand';

interface Task {
  id: number;
  name: string;
  environment: string;
  date: null | Date;
  duration: null | string;
  calories: number;
  local: null | string;
  distanceKm: string;
  participationId: number;
  usersId: string;
}

interface DesafioStore {
  participationId: number | null;
  desafioName: string | null;
  taskData: Task | null;
  setDesafioData: (participationId: number, desafioName: string) => void;
  setTaskData: (taskData: Task) => void;
  clearDesafioData: () => void;
  clearTaskData: () => void;
}

const useDesafioStore = create<DesafioStore>((set) => ({
  participationId: null,
  desafioName: null,
  taskData: null,
  setDesafioData: (participationId, desafioName) => 
    set({ participationId, desafioName }),
  setTaskData: (taskData) =>
    set({ taskData }),
  clearDesafioData: () => 
    set({ participationId: null, desafioName: null }),
  clearTaskData: () =>
    set({ taskData: null })
}));

export default useDesafioStore; 