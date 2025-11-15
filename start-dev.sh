#!/bin/bash

# رنگ‌ها برای خروجی
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تابع برای نمایش پیام
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info "شروع راه‌اندازی فرانت‌اند..."

# بررسی وجود Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js نصب نشده است. لطفاً Node.js را نصب کنید."
    exit 1
fi

# بررسی وجود npm
if ! command -v npm &> /dev/null; then
    print_error "npm نصب نشده است. لطفاً npm را نصب کنید."
    exit 1
fi

# بررسی وجود فایل .env
if [ ! -f ".env" ]; then
    print_warning "فایل .env یافت نشد. از .env.example استفاده می‌شود."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "فایل .env از .env.example ایجاد شد."
    else
        print_error "فایل .env.example نیز یافت نشد!"
        exit 1
    fi
fi

# بررسی وجود node_modules
if [ ! -d "node_modules" ]; then
    print_warning "node_modules یافت نشد. در حال نصب dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "خطا در نصب dependencies!"
        exit 1
    fi
    print_success "Dependencies نصب شدند."
fi

# بررسی اینکه آیا سرور در حال اجرا است
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    print_warning "پورت 3001 در حال استفاده است."
    read -p "آیا می‌خواهید ادامه دهید؟ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "متوقف شد."
        exit 0
    fi
fi

# راه‌اندازی سرور
print_info "راه‌اندازی سرور Next.js..."
print_success "سرور در حال راه‌اندازی است..."
print_info "برای توقف، Ctrl+C را فشار دهید."
print_info "فرانت‌اند در آدرس http://localhost:3001 در دسترس خواهد بود"
echo ""

npm run dev

