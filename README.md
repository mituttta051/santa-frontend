# Secret Santa Frontend

Frontend приложение для игры в Тайного Санту, построенное на Next.js, React, TypeScript, Tailwind CSS и shadcn/ui.

## 🚀 Технологии

- **Next.js 16** с App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (New York style)
- **PWA** (Progressive Web App)

## 📋 Требования

- Node.js 18+ 
- npm или yarn
- Запущенный бэкенд на `http://localhost:8080` (или настройте переменную окружения)

## 🛠️ Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

3. Создайте иконки для PWA (см. `PWA_ICONS.md`):
   - `public/icon-192.png` (192x192)
   - `public/icon-512.png` (512x512)

## 🏃 Запуск

### Разработка
```bash
npm run dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000)

### Продакшн
```bash
npm run build
npm start
```

## 📱 Использование

### Для пользователей

1. Перейдите по уникальной ссылке события: `/events/[slug]`
2. Введите своё имя
3. Заполните вишлист
4. После генерации пар админом увидите своего внучка

### Для администраторов

1. Перейдите на `/admin`
2. Создайте новое событие с уникальным slug
3. Поделитесь ссылкой `/events/[slug]` с участниками
4. После регистрации участников нажмите "Сгенерировать пары"

## 📁 Структура проекта

```
santa-frontend/
├── app/                    # Next.js App Router страницы
│   ├── page.tsx           # Главная страница
│   ├── events/[slug]/     # Страница события
│   └── admin/             # Админ-панель
├── components/            # React компоненты
│   └── ui/                # shadcn/ui компоненты
├── lib/                   # Утилиты и API клиент
│   ├── api.ts            # API функции
│   ├── context.tsx       # React Context для состояния
│   └── utils.ts          # Вспомогательные функции
└── public/                # Статические файлы
```

## 🔧 Настройка

### API URL

По умолчанию приложение подключается к `http://localhost:8080/api`. Измените `NEXT_PUBLIC_API_URL` в `.env.local` для другого адреса.

### PWA

PWA настроено автоматически через `next-pwa`. В режиме разработки service worker отключен. Для продакшна:

1. Создайте иконки (см. `PWA_ICONS.md`)
2. Запустите `npm run build`
3. Service worker будет автоматически зарегистрирован

## 📝 API Endpoints

Приложение использует следующие эндпоинты бэкенда:

- `GET /api/events` - список событий
- `GET /api/events/{id}` - событие по ID
- `POST /api/events` - создать событие
- `POST /api/events/{id}/generate-pairs` - сгенерировать пары
- `GET /api/users` - список пользователей
- `POST /api/users` - создать пользователя
- `GET /api/participants` - список участников
- `POST /api/participants` - создать участника
- `PATCH /api/participants/{id}/wishlist` - обновить вишлист

## 🎨 Стилизация

Приложение использует:
- **Tailwind CSS** для стилей
- **shadcn/ui** для компонентов
- **CSS Variables** для темизации (поддержка dark mode)
- **Lucide React** для иконок

## 📱 PWA Features

- Установка на домашний экран
- Работа офлайн (после первой загрузки)
- Адаптивный дизайн для мобильных устройств

## 🐛 Известные ограничения

- Пары загружаются только после генерации админом на странице события
- Для получения пар по событию нужен дополнительный эндпоинт на бэкенде
- Иконки PWA нужно создать вручную

## 📄 Лицензия

Private project
