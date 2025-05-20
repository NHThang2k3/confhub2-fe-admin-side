// src/utils/socket.ts
import io, { Socket } from 'socket.io-client';

// --- Logic tính toán URL và path (giữ nguyên từ hook của bạn) ---
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
        logAnalysisSocketIoBaseUrl = ''; // Clear base URL on error
    }
} else if (!LOG_ANALYSIS_SERVICE_URL_CONFIG && typeof window !== 'undefined') {
    console.warn("[LogAnalysisSocket Init] LOG_ANALYSIS_SERVICE_URL_CONFIG is not configured. Socket connection will not be attempted.");
}
// --- Kết thúc Logic tính toán URL và path ---

// Sử dụng một biến global hoặc bên ngoài scope để giữ instance
let socketInstance: Socket | null = null;

// Hàm để lấy hoặc tạo instance socket
export const getSocketInstance = (token: string | null): Socket | null => {
    // Chỉ tạo instance nếu có URL base VÀ chưa có instance HOẶC instance hiện tại đã bị ngắt kết nối
    // Điều này giúp tránh tạo lại instance không cần thiết
    if (!logAnalysisSocketIoBaseUrl || typeof window === 'undefined') {
         //console.warn("[getSocketInstance] Socket base URL not configured or not in browser.");
        return null; // Cannot create socket without a base URL or not in browser
    }

    // Nếu chưa có instance HOẶC instance bị ngắt kết nối (ví dụ: do lỗi mạng, server restart)
    if (!socketInstance || !socketInstance.connected) {
        if (!token) {
             //console.warn("[getSocketInstance] Attempted to create socket without token.");
             return null; // Cannot create socket without token
        }
         if (socketInstance) {
             // Clean up previous potentially failed instance
             socketInstance.removeAllListeners();
             socketInstance = null;
         }

         console.log("[getSocketInstance] Creating new socket instance...");
         socketInstance = io(logAnalysisSocketIoBaseUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 3, // Giữ lại các option này
            reconnectionDelay: 2000,
            auth: { token: token },
            ...(logAnalysisSocketIoPathOption && logAnalysisSocketIoPathOption !== '/socket.io/' && { path: logAnalysisSocketIoPathOption }),
            autoConnect: false, // Quan trọng: Tránh tự động kết nối ngay khi tạo
         });

        // Thêm các listener cơ bản ở đây (hoặc để hook handle riêng)
        // Để hook handle riêng sẽ linh hoạt hơn, vì hook cần state (setIsConnected, setSocketError)
        // socketInstance.on('connect', () => { console.log('Socket connected!'); });
        // socketInstance.on('disconnect', (reason) => { console.log('Socket disconnected:', reason); });
        // socketInstance.on('connect_error', (err) => { console.error('Socket connect error:', err); });
        // socketInstance.on('auth_error', (authError) => { console.error('Socket auth error:', authError); });

        // Kết nối instance mới sau khi tạo
        socketInstance.connect();
    } else {
        // Nếu instance đã tồn tại và đang kết nối, có thể cập nhật token nếu cần
        // Socket.IO v3+ hỗ trợ cập nhật auth: socket.auth = { token: newToken };
        // Tuy nhiên, cách này có thể cần server side logic để xử lý token update request.
        // Cách an toàn hơn là disconnect và reconnect nếu token thay đổi đáng kể
        // Nhưng với useLogAnalysisData, token không đổi trong suốt lifecycle của session auth,
        // nên chỉ cần đảm bảo instance tồn tại và kết nối là đủ.
        //console.log("[getSocketInstance] Using existing socket instance.");
         if (token && socketInstance.auth && (socketInstance.auth as any).token !== token) {
             // Chỉ log cảnh báo hoặc xử lý trường hợp hiếm token thay đổi
             console.warn("[getSocketInstance] Socket token mismatch, but using existing connection.");
             // Nếu cần force reconnect khi token thay đổi, uncomment dòng dưới:
             // socketInstance.disconnect(); socketInstance = null; return getSocketInstance(token);
         }
    }

    return socketInstance;
};

// Bạn cũng có thể cung cấp một cách để đóng socket khi cần (ví dụ: khi đăng xuất)
export const disconnectSocket = () => {
    if (socketInstance) {
        console.log("[disconnectSocket] Disconnecting socket instance.");
        socketInstance.removeAllListeners(); // Remove all listeners before disconnecting
        socketInstance.disconnect();
        socketInstance = null;
    }
};