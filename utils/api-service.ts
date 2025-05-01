import useAuthStore from "../store/auth-store";

export interface UserData {
  id: string;
  avatar_url: string | null;
  avatar_filename: string | null;
  full_name: string | null;
  bio: string | null;
  gender: string | null;
  sport: string | null;
  createdAt: Date;
  usersId: string;
  username: string;
  birthDate: string | null
}

export interface AllDesafios {
  id: number;
  name: string;
  description: string;
  distance: string;
  isRegistered: boolean;
  completed: boolean;
  completedAt: null | Date;
  progress: number;
  photo: string;
}

export interface RouteResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  distance: string;
  inscription: Inscription[];
}

export interface Inscription {
  user: User;
  progress: number;
}

export interface User {
  id: string;
  name: string;
  UserData: UserData | null;
}

export interface RankData {
  position: number;
  userId: string;
  userName: string;
  userAvatar: string;
  totalDistance: number;
  totalDuration: number;
  avgSpeed: number;
}

// API base URL
const API_BASE_URL = "http://10.0.2.2:3000";

// Get auth token from store
const getToken = () => {
  return useAuthStore.getState().token;
};

// pegas os dados do usuário
export const fetchUserData = async (): Promise<UserData> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/users/getUserData`, {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};

// pega todos os desafios
export const fetchAllDesafios = async (): Promise<AllDesafios[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/desafio/getAllDesafio`, {
    headers: {
      "Content-type": "application/json",
      authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};

// pega os dados da rota
export const fetchRouteData = async (desafioId: string | number): Promise<RouteResponse> => {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/desafio/getdesafio/${desafioId}`,
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route data");
  }

  const data: RouteResponse = await response.json();

  // Verifica se a propriedade 'location' existe e é válida
  if (!data.location || typeof data.location !== "string") {
    throw new Error("Invalid or missing location data");
  }

  const coordinates = JSON.parse(data.location);

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error("Invalid or empty coordinates");
  }

  return data;
};

// Pega os dados do rank
export const fetchRankData = async (desafioId: string | number): Promise<RankData[]> => {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/users/getRanking/${desafioId}`, 
    {
      headers: {
        "Content-type": "application/json",
        authorization: "Bearer " + token,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  
  return await response.json();
};
