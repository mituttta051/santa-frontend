// Главный файл API - реэкспортирует все модули для обратной совместимости

// Типы и интерфейсы
export type {
  Event,
  User,
  Participant,
  PairDto,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  PhoneAuthRequest,
  PhoneAuthResponse,
  MessageDto,
  SendMessageRequest,
} from "./types";

// Функции для работы с токеном
export {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getAuthHeaders,
} from "./token";

// API для событий
export {
  getEvents,
  getEventById,
  getEventBySlug,
  createEvent,
  generatePairs,
  getEventPairs,
} from "./events";

// API для пользователей
export {
  getUsers,
  createUser,
  getCurrentUser,
} from "./users";

// API для участников
export {
  getParticipants,
  createParticipant,
  updateWishlist,
} from "./participants";

// API для авторизации
export {
  register,
  login,
  logout,
  checkUserExists,
  authenticateOrRegisterByPhone,
} from "./auth";

// API для сообщений
export {
  getMessages,
  sendMessage,
  markMessageAsRead,
} from "./messages";
