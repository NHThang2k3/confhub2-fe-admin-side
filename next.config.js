// next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/admin',
    trailingSlash: true, // <<<< THÊM/BẬT DÒNG NÀY

    // Quan trọng: Nếu bạn đang dùng next-intl với app router (thư mục app/)
    // và i18n routing (ví dụ: /admin/en/dashboard),
    // bạn KHÔNG cần cấu hình gì thêm ở đây cho next-intl liên quan đến basePath.
    // next-intl sẽ tự động hoạt động với basePath.
    // Plugin next-intl đã được gọi ở dưới.
};

module.exports = withNextIntl(nextConfig);