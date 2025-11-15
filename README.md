# High Win Rate Frontend

فرانت‌اند فروشگاه استراتژی‌های معاملاتی با Next.js و TypeScript

## 🚀 راه‌اندازی سریع

```bash
# نصب dependencies
npm install

# راه‌اندازی سرور توسعه
npm run dev
```

پس از راه‌اندازی، اپلیکیشن در `http://localhost:3001` در دسترس خواهد بود.

## 📚 اسکریپت‌ها

```bash
# راه‌اندازی سرور توسعه
npm run dev

# ساخت برای production
npm run build

# راه‌اندازی سرور production
npm start

# اجرای linter
npm run lint
```

## 🔧 تنظیمات

1. فایل `.env.local` را از `.env.example` کپی کنید:
```bash
cp .env.example .env.local
```

2. متغیرهای محیطی را تنظیم کنید:
- `NEXT_PUBLIC_API_URL`: آدرس API بک‌اند (پیش‌فرض: `http://localhost:3000`)

## 🛠️ تکنولوژی‌ها

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint

## 📁 ساختار پروژه

```
frontend/
├── app/              # صفحات و routeها (App Router)
├── components/       # کامپوننت‌های قابل استفاده مجدد
├── lib/             # توابع و utilities
├── public/          # فایل‌های استاتیک
└── types/           # تعاریف TypeScript
```

## 🔗 اتصال به Backend

بک‌اند در `http://localhost:3000` اجرا می‌شود و API documentation در `http://localhost:3000/api` (Swagger UI) در دسترس است.

## 📝 پیش‌نیازها

- Node.js 18+
- npm

## 🚀 شروع کار

1. کلون کردن پروژه:
```bash
git clone git@github.com:HighWinRate/frontend.git
cd frontend
```

2. نصب dependencies:
```bash
npm install
```

3. تنظیم متغیرهای محیطی:
```bash
cp .env.example .env.local
# ویرایش .env.local و تنظیم NEXT_PUBLIC_API_URL
```

4. راه‌اندازی سرور توسعه:
```bash
npm run dev
```

5. باز کردن مرورگر:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api`
