// src/utils/socket.ts
import io, { Socket } from 'socket.io-client';

// --- Logic tính toán URL và path (giữ nguyên) ---
const LOG_ANALYSIS_SERVICE_URL_CONFIG = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
let logAnalysisSocketIoBaseUrl: string = '';
let logAnalysisSocketIoPathOption: string | undefined = undefined;

if (typeof window !== 'undefined' && LOG_ANALYSIS_SERVICE_URL_CONFIG) {
    try {
        const serviceUrlParsed = new URL(LOG_ANALYSIS_SERVICE_URL_CONFIG);
        const socketProtocol = serviceUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:';
        logAnalysisSocketIoBaseUrl = `${socketProtocol}//${serviceUrlParsed.hostname}${serviceUrlParsed.port ? `:${serviceUrlParsed.port}` : ''}`;
        let normalizedServicePath = serviceUrlParsed.pathname.startsWith('/') ? serviceUrlParsed.pathname : '/' + serviceUrlParsed.pathname;
        if (normalizedServicePath !== '/' && !normalizedServicePath.endsWith('/')) {
            normalizedServicePath += '/';
        }
        logAnalysisSocketIoPathOption = normalizedServicePath + 'socket.io/';
    } catch (e) {
        console.error("[LogAnalysisSocket Init] Failed to parse log analysis service URL from config:", LOG_ANALYSIS_SERVICE_URL_CONFIG, e);
        logAnalysisSocketIoBaseUrl = '';
    }
} else if (!LOG_ANALYSIS_SERVICE_URL_CONFIG && typeof window !== 'undefined') {
    console.warn("[LogAnalysisSocket Init] LOG_ANALYSIS_SERVICE_URL_CONFIG is not configured. Socket connection will not be attempted.");
}
// --- Kết thúc Logic tính toán URL và path ---

let socketInstance: Socket | null = null;

// Định nghĩa một interface cho cấu trúc auth mong đợi
interface AuthObject {
    token: string | null;
    // Bạn có thể thêm các thuộc tính khác vào đây nếu cần
    [key: string]: any;
}

export const getSocketInstance = (token: string | null): Socket | null => {
    if (!logAnalysisSocketIoBaseUrl || typeof window === 'undefined') {
        return null;
    }

    if (!token) {
        if (socketInstance) {
            console.log("[getSocketInstance] No token, disconnecting existing socket instance.");
            socketInstance.disconnect();
            socketInstance.removeAllListeners();
            socketInstance = null;
        }
        return null;
    }

    if (!socketInstance) {
        console.log("[getSocketInstance] Creating new socket instance...");
        socketInstance = io(logAnalysisSocketIoBaseUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            auth: { token: token } as AuthObject, // Ép kiểu ở đây vì bạn biết chắc chắn cấu trúc khi tạo mới
            ...(logAnalysisSocketIoPathOption && logAnalysisSocketIoPathOption !== '/socket.io/' && { path: logAnalysisSocketIoPathOption }),
            autoConnect: false,
        });
    } else {
        // Kiểm tra và cập nhật token nếu cần
        const currentAuth = socketInstance.auth;
        if (typeof currentAuth === 'object' && currentAuth !== null) {
            // Bây giờ TypeScript biết currentAuth là một object
            // Chúng ta có thể ép kiểu nó thành AuthObject để truy cập 'token'
            const authAsObject = currentAuth as AuthObject;
            if (authAsObject.token !== token) {
                console.log("[getSocketInstance] Updating token for existing socket instance.");
                // Cập nhật toàn bộ object auth
                socketInstance.auth = { ...authAsObject, token: token };
            }
        } else if (typeof currentAuth === 'function') {
            // Nếu auth là một function, việc cập nhật token phức tạp hơn.
            // Socket.IO thường mong đợi bạn gọi callback được cung cấp bởi hàm này.
            // Trong trường hợp đơn giản chỉ muốn cập nhật token, có thể cần phải disconnect và reconnect
            // hoặc thay đổi cách server xử lý auth.
            // Hiện tại, chúng ta có thể quyết định gán lại auth là một object.
            console.warn("[getSocketInstance] socket.auth was a function. Overwriting with new token object.");
            socketInstance.auth = { token: token } as AuthObject;
            // Cân nhắc: có thể cần socketInstance.disconnect() và socketInstance.connect() sau khi thay đổi auth
            // nếu server không tự động nhận diện thay đổi này khi socket đang kết nối.
        } else {
            // Trường hợp currentAuth là null, undefined hoặc không phải object/function (ít xảy ra)
            console.log("[getSocketInstance] socket.auth is not in expected format. Setting new auth object.");
            socketInstance.auth = { token: token } as AuthObject;
        }
    }
    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        console.log("[disconnectSocket] Disconnecting socket instance.");
        socketInstance.disconnect();
        socketInstance.removeAllListeners();
        socketInstance = null;
    }
};