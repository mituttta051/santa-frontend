// Типы и интерфейсы для API

export interface Event {
  id: string;
  name: string;
  slug?: string;
  signupDeadline?: string;
  assignmentAt?: string;
  wishlistReleaseAt: string;
  giftDate?: string;
  revealAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  phoneNumber?: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  wishlist?: string;
  eventId: string;
  userId: string;
  santaCollectionId?: string;
  selectedTasks?: SantaTask[];
}

export interface PairDto {
  santaId: string;
  santaName: string;
  childId: string;
  childName: string;
  childWishlist?: string;
}

// Авторизация
export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  name: string;
  wishlist?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PhoneAuthRequest {
  phoneNumber: string;
  name?: string; // Optional, only required for new users
}

export interface PhoneAuthResponse {
  user: User | null; // Can be null if user doesn't exist
  isNewUser: boolean;
}

// Сообщения
export interface MessageDto {
  id: string;
  eventId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface SendMessageRequest {
  senderId: string;
  recipientId: string;
  content: string;
}

// Задачи и коллекции задач
export interface SantaTask {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface SantaCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tasks: SantaTask[];
}

export interface CreateSantaCollectionRequest {
  name: string;
  description?: string;
  taskIds?: string[];
  tasks?: CreateTaskRequest[];
}

