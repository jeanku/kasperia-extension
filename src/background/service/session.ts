import {permissionService} from './index';

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

    setProp({origin, icon, name}: SessionData) {
        this.origin = origin;
        this.icon = icon;
        this.name = name;
    }
}

// for each tab
const sessionMap = new Map();

const getSession = (id: number) => {
    return sessionMap.get(id);
};

const getOrCreateSession = (id: number, data: SessionData | null) => {
    if (sessionMap.has(id)) {
        return getSession(id);
    }
    return createSession(id, data);
};

const createSession = (id: number, data: SessionData | null) => {
    const session = new Session(data);
    sessionMap.set(id, session);
    return session;
};

const deleteSession = (id: string) => {
    sessionMap.delete(id);
};

const broadcastEvent = async (ev: any, data?: any, origin?: string) => {
    for (const session of sessionMap.values()) {
        const has = await permissionService.hasPermission(session.origin);
        if (!has) continue;
        try {
            session.pushMessage?.(ev, data);
        } catch {
            deleteSession(session.key);
        }
    }
};

export default {
    getSession,
    getOrCreateSession,
    deleteSession,
    broadcastEvent
};
