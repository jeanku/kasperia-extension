import { permissionService } from '@/background/service';

interface SessionData {
  origin: string;
  icon: string;
  name: string;
}

export class Session {
  origin = '';

  icon = '';

  name = '';

  constructor(data: SessionData | null) {
    if (data) {
      this.setProp(data);
    }
  }

  setProp({ origin, icon, name }: SessionData) {
    this.origin = origin;
    this.icon = icon;
    this.name = name;
  }
}

// for each tab
const sessionMap = new Map();

const getSession = (id: string) => {
  return sessionMap.get(id);
};

const getOrCreateSession = (id: string) => {
  if (sessionMap.has(id)) {
    return getSession(id);
  }

  return createSession(id, null);
};

const createSession = (id: string, data: SessionData | null) => {
  const session = new Session(data);
  sessionMap.set(id, session);

  return session;
};

const deleteSession = (id: string) => {
  sessionMap.delete(id);
};

const broadcastEvent = (ev: any, data?: any, origin?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sessions: any[] = [];
  sessionMap.forEach((session, key) => {
    if (permissionService.hasPermission(session.origin)) {
      sessions.push({
        key,
        ...session
      });
    }
  });

  // same origin
  if (origin) {
    sessions = sessions.filter((session) => session.origin === origin);
  }

  sessions.forEach((session) => {
    try {
      session.pushMessage?.(ev, data);
    } catch (e) {
      if (sessionMap.has(session.key)) {
        deleteSession(session.key);
      }
    }
  });
};

export default {
  getSession,
  getOrCreateSession,
  deleteSession,
  broadcastEvent
};
