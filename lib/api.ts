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
  createEvent,
  generatePairs,
  regeneratePairs,
  getEventPairs,
  getSelectedTasksForSanta,
  selectTasksForSanta,
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
  assignCollectionToParticipant,
  unassignCollectionFromParticipant,
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

// API для push subscriptions
export {
  savePushSubscription,
  removePushSubscription,
  serializePushSubscription,
  type PushSubscriptionData,
} from "./push-subscriptions";

// API для задач и коллекций
export {
  getSantaTasks,
  getSantaTaskById,
} from "./santa-tasks";

export {
  getSantaCollections,
  getSantaCollectionById,
  createSantaCollection,
} from "./santa-collections";

// API для выполнения заданий
export {
  getMyTasksAsSanta,
  completeTaskWithPhoto,
  completeTaskWithExistingPhoto,
  getAllUserPhotos,
  type CompleteTaskRequest,
} from "./task-completion";

// API для работы с файлами
export { uploadFile } from "./files";
