# Scraping thời tiết đơn giản với Playwright (Node.js)

Dự án này cung cấp một script Node.js sử dụng Playwright để lấy nhanh thông tin thời tiết từ một trang web công khai (timeanddate.com).

## Request mẫu để test nhanh (curl)
- Health check:
```bash
curl http://localhost:3000/
```
- Scrape theo country/city:
```bash
curl "http://localhost:3000/api/scrape?country=vietnam&city=ho-chi-minh-city"
```
- Scrape theo URL trực tiếp:
```bash
curl "http://localhost:3000/api/scrape?url=https://www.timeanddate.com/weather/vietnam/hanoi"
```

## Yêu cầu
- Node.js 16+
- Truy cập Internet

## Cài đặt
```bash
npm install
# (Lần đầu) tải trình duyệt Chromium cho Playwright
# Nếu postinstall chưa chạy, bạn có thể chạy thủ công:
# npx playwright install chromium
```

## Cách dùng

### 1) Dùng qua CLI
Chạy mặc định (thời tiết TP. Hồ Chí Minh, Việt Nam):
```bash
npm run scrape:example
```

Tùy chỉnh country/city (dạng slug, chữ thường, gạch nối):
```bash
npm run scrape -- --country vietnam --city hanoi
# hoặc
node src/scrape-weather.js --country vietnam --city da-nang
```

Truyền trực tiếp URL (ưu tiên hơn country/city):
```bash
node src/scrape-weather.js --url "https://www.timeanddate.com/weather/vietnam/ho-chi-minh-city"
```

Chạy có giao diện (debug):
```bash
node src/scrape-weather.js --headful
```

Thời gian chờ (ms):
```bash
node src/scrape-weather.js --timeout 30000
```

### 2) Dùng qua API HTTP
Khởi động server:
```bash
npm start
# Mặc định chạy tại http://localhost:3000
```

Gọi API (trả về JSON):
```bash
# Bằng country/city (mặc định dùng vietnam/ho-chi-minh-city nếu thiếu)
curl "http://localhost:3000/api/scrape?country=vietnam&city=ho-chi-minh-city"

# Bằng URL trực tiếp (ưu tiên hơn country/city)
curl "http://localhost:3000/api/scrape?url=https://www.timeanddate.com/weather/vietnam/hanoi"

# Tùy chọn timeout (ms) và headful (debug)
curl "http://localhost:3000/api/scrape?country=vietnam&city=hanoi&timeout=30000&headful=false"
```

Health check:
```bash
curl http://localhost:3000/
```

## Đầu ra
Script in ra JSON, ví dụ:
```json
{
  "url": "https://www.timeanddate.com/weather/vietnam/ho-chi-minh-city",
  "location": "Weather in Ho Chi Minh City, Vietnam",
  "temperature": "30 °C",
  "condition": "Passing clouds.",
  "scrapedAt": "2025-08-21T16:07:00.123Z",
  "durationMs": 1234
}
```

## Chạy bằng Docker

### Build image
```bash
# Tại thư mục dự án
docker build -t weather-scraper:latest .
```

### Chạy API trong container
```bash
docker run --rm -p 3000:3000 weather-scraper:latest
# Server sẽ lắng nghe tại http://localhost:3000
```

Gọi API:
```bash
# Country/city
curl "http://localhost:3000/api/scrape?country=vietnam&city=ho-chi-minh-city"

# Theo URL trực tiếp
curl "http://localhost:3000/api/scrape?url=https://www.timeanddate.com/weather/vietnam/hanoi"

# Tùy chọn timeout/headful
curl "http://localhost:3000/api/scrape?country=vietnam&city=hanoi&timeout=30000&headful=false"
```

Ghi chú Docker:
- Image sử dụng base mcr.microsoft.com/playwright:v1.46.0-jammy đã có sẵn Chromium và dependencies.
- Biến môi trường PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 được bật để bỏ qua tải lại trình duyệt khi cài đặt.
- Container expose cổng 3000; map ra ngoài bằng -p 3000:3000.

## Ghi chú
- Nguồn dữ liệu: https://www.timeanddate.com/weather/<country>/<city>
- Selectors chính: `#qlook .h2` (nhiệt độ), `#qlook p` (mô tả/điều kiện).
- Cấu trúc trang có thể thay đổi theo thời gian; nếu selector không còn đúng, hãy cập nhật lại trong `src/scrape-weather.js`.
