export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  reactions?: { emoji: string; count: number; mine: boolean }[];
  file?: { name: string; size: string; type: 'image' | 'file' };
  status?: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  members?: number;
  messages: Message[];
  color: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
  phone?: string;
  color: string;
}

export const contacts: Contact[] = [
  { id: 'c1', name: 'Алина Громова', avatar: 'АГ', status: 'В сети', online: true, phone: '+7 900 123-45-67', color: '#a855f7' },
  { id: 'c2', name: 'Дмитрий Соколов', avatar: 'ДС', status: 'Был час назад', online: false, phone: '+7 911 234-56-78', color: '#00d4ff' },
  { id: 'c3', name: 'Мария Белова', avatar: 'МБ', status: 'В сети', online: true, phone: '+7 922 345-67-89', color: '#f472b6' },
  { id: 'c4', name: 'Иван Петров', avatar: 'ИП', status: 'Не беспокоить', online: false, phone: '+7 933 456-78-90', color: '#4ade80' },
  { id: 'c5', name: 'Елена Сидорова', avatar: 'ЕС', status: 'В сети', online: true, phone: '+7 944 567-89-01', color: '#fb923c' },
  { id: 'c6', name: 'Артём Козлов', avatar: 'АК', status: 'Был 3 часа назад', online: false, phone: '+7 955 678-90-12', color: '#f59e0b' },
];

export const chats: Chat[] = [
  {
    id: '1',
    name: 'Алина Громова',
    avatar: 'АГ',
    lastMessage: 'Окей, увидимся завтра! 😊',
    time: '12:34',
    unread: 3,
    online: true,
    isGroup: false,
    color: '#a855f7',
    messages: [
      { id: 'm1', text: 'Привет! Как дела?', time: '12:10', isOwn: false, status: 'read' },
      { id: 'm2', text: 'Отлично, спасибо! Работаю над новым проектом', time: '12:15', isOwn: true, status: 'read' },
      { id: 'm3', text: 'О, круто! Расскажешь подробнее?', time: '12:18', isOwn: false, reactions: [{ emoji: '🔥', count: 1, mine: false }], status: 'read' },
      { id: 'm4', text: 'Делаю мессенджер с крутым дизайном 🎨', time: '12:25', isOwn: true, status: 'read' },
      { id: 'm5', text: 'Звучит здорово! Покажешь когда будет готово?', time: '12:28', isOwn: false, status: 'read' },
      { id: 'm6', text: 'Конечно! Планирую показать уже завтра', time: '12:30', isOwn: true, status: 'read' },
      { id: 'm7', text: 'Окей, увидимся завтра! 😊', time: '12:34', isOwn: false, reactions: [{ emoji: '❤️', count: 2, mine: true }, { emoji: '👍', count: 1, mine: false }], status: 'read' },
    ]
  },
  {
    id: '2',
    name: 'Команда дизайна',
    avatar: '🎨',
    lastMessage: 'Максим: Новые макеты готовы!',
    time: '11:55',
    unread: 7,
    online: true,
    isGroup: true,
    members: 8,
    color: '#00d4ff',
    messages: [
      { id: 'm1', text: 'Всем привет! Готово к ревью?', time: '11:30', isOwn: false, status: 'read' },
      { id: 'm2', text: 'Да, смотрю уже!', time: '11:35', isOwn: true, status: 'read' },
      { id: 'm3', text: 'Мне нравятся новые цвета 🔥', time: '11:40', isOwn: false, reactions: [{ emoji: '🔥', count: 3, mine: true }], status: 'read' },
      { id: 'm4', text: 'Новые макеты готовы!', time: '11:55', isOwn: false, file: { name: 'design_v2.fig', size: '12.4 MB', type: 'file' }, status: 'read' },
    ]
  },
  {
    id: '3',
    name: 'Дмитрий Соколов',
    avatar: 'ДС',
    lastMessage: 'Ладно, созвонимся',
    time: '10:22',
    unread: 0,
    online: false,
    isGroup: false,
    color: '#f472b6',
    messages: [
      { id: 'm1', text: 'Дмитрий, ты смотрел отчёт?', time: '09:50', isOwn: true, status: 'read' },
      { id: 'm2', text: 'Да, сейчас изучаю. Есть вопросы', time: '10:00', isOwn: false, status: 'read' },
      { id: 'm3', text: 'Пиши, отвечу', time: '10:05', isOwn: true, status: 'read' },
      { id: 'm4', text: 'Ладно, созвонимся', time: '10:22', isOwn: false, status: 'read' },
    ]
  },
  {
    id: '4',
    name: 'Стартап Rocket 🚀',
    avatar: '🚀',
    lastMessage: 'Инвесторы дали зелёный свет!',
    time: 'Вчера',
    unread: 12,
    online: true,
    isGroup: true,
    members: 15,
    color: '#4ade80',
    messages: [
      { id: 'm1', text: 'Встреча с инвесторами прошла отлично!', time: '18:00', isOwn: false, status: 'read' },
      { id: 'm2', text: 'Серьёзно?! Расскажи!', time: '18:05', isOwn: true, status: 'read' },
      { id: 'm3', text: 'Инвесторы дали зелёный свет!', time: '18:10', isOwn: false, reactions: [{ emoji: '🎉', count: 8, mine: true }, { emoji: '🔥', count: 5, mine: false }], status: 'read' },
    ]
  },
  {
    id: '5',
    name: 'Мария Белова',
    avatar: 'МБ',
    lastMessage: 'Фотки с вечеринки 📸',
    time: 'Вчера',
    unread: 0,
    online: true,
    isGroup: false,
    color: '#fb923c',
    messages: [
      { id: 'm1', text: 'Фотки с вечеринки 📸', time: '23:45', isOwn: false, file: { name: 'party.jpg', size: '3.2 MB', type: 'image' }, status: 'read' },
    ]
  },
];

export const currentUser = {
  id: 'me',
  name: 'Александр Новиков',
  avatar: 'АН',
  status: 'В сети',
  phone: '+7 999 000-11-22',
  email: 'alex@pulse.app',
  color: '#a855f7',
};
