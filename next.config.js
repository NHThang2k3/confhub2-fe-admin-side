const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/admin', // <<<< THÊM DÒNG NÀY
    
    // Quan trọng: Nếu bạn đang dùng next-intl với app router (thư mục app/)
    // và i18n routing (ví dụ: /admin/en/dashboard),
    // bạn KHÔNG cần cấu hình gì thêm ở đây cho next-intl liên quan đến basePath.
    // next-intl sẽ tự động hoạt động với basePath.
    // Plugin next-intl đã được gọi ở dưới.

    // Optional: Nếu bạn gặp vấn đề với việc thiếu dấu gạch chéo cuối (trailing slash)
    // khi truy cập trực tiếp vào /admin (ví dụ: trang trắng), bạn có thể thử:
    // trailingSlash: true,
    // Điều này sẽ làm cho Next.js tự động thêm dấu / vào cuối các URL không có file extension.
    // Ví dụ: /admin -> /admin/, /admin/dashboard -> /admin/dashboard/
    // Hãy kiểm tra kỹ lưỡng nếu bạn bật tùy chọn này.
};

module.exports = withNextIntl(nextConfig);