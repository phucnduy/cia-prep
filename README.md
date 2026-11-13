# CIA Prep - Ôn thi Certified Internal Auditor

Trang web học và thi thử chứng chỉ **CIA (Certified Internal Auditor)** theo **syllabus CIA 2025** của IIA, bao gồm cả 3 phần thi. Giao diện tiếng Việt, thuật ngữ chuyên môn giữ kèm tiếng Anh.

> Bộ câu hỏi do cộng đồng biên soạn để luyện tập, không phải câu hỏi thi thật. Dự án không liên kết với The Institute of Internal Auditors (IIA). CIA® là nhãn hiệu của IIA.

## Cấu trúc đề thi (theo IIA)

| Phần | Tên | Số câu | Thời gian | Các phần (tỷ trọng) |
|---|---|---|---|---|
| Part 1 | Internal Audit Fundamentals | 125 | 150 phút | A. Nền tảng KTNB 35% · B. Đạo đức và Tính chuyên nghiệp 20% · C. Quản trị, Rủi ro, Kiểm soát 30% · D. Rủi ro gian lận 15% |
| Part 2 | Internal Audit Engagement | 100 | 120 phút | A. Lập kế hoạch 50% · B. Thu thập, phân tích, đánh giá 40% · C. Giám sát và trao đổi 10% |
| Part 3 | Internal Audit Function | 100 | 120 phút | A. Vận hành chức năng 25% · B. Kế hoạch kiểm toán 15% · C. Chất lượng (QAIP) 15% · D. Kết quả và theo dõi 45% |

Nguồn: [CIA Exam: Why and How It's Changing (IIA)](https://www.theiia.org/globalassets/site/certifications/certified-internal-auditor/cia-exam-why-how-and-what-is-changing/cia-exam-why-and-how-it-is-changing2.pdf). Điểm thi thật theo thang 250-750, đạt từ 600. IIA không công bố cách quy đổi, nên ứng dụng chỉ hiện tỷ lệ đúng.

## Tình trạng nội dung

| Phần | Câu hỏi | Bài học | Thẻ kiến thức | Trạng thái |
|---|---|---|---|---|
| Part 1 | 262 (phần lớn dạng tình huống; 128 câu khó) | 27/27 chủ đề, bài chi tiết (khoảng 950 từ/bài, ví dụ, bảng so sánh, tự kiểm tra) | 53 | Sẵn sàng: đủ câu cho đề 125 câu theo đúng tỷ trọng |
| Part 2 | 23 (8 câu khó) | 17/17 chủ đề | 5 | Đang biên soạn: có đề rút gọn, chưa đủ đề đầy đủ |
| Part 3 | 26 (7 câu khó) | 18/18 chủ đề | 11 | Đang biên soạn: có đề rút gọn, chưa đủ đề đầy đủ |

Khi một phần đủ câu cho mọi section, đổi `"status": "draft"` thành `"ready"` trong `public/data/<part>/manifest.json`.

## Tính năng

- **Tìm hiểu CIA**: điều kiện ghi danh, quy trình thi, lệ phí, duy trì chứng chỉ, cách học, kỹ năng làm bài, câu hỏi thường gặp; quy định và lệ phí đối chiếu với trang chính thức của IIA.
- **Thi thử mô phỏng**: đủ số câu và thời gian như đề thật, rút câu theo tỷ trọng từng section, ưu tiên câu chưa gặp ở các lần làm trước, xáo trộn thứ tự đáp án mỗi lần thi, bấm giờ (tự nộp khi hết giờ), chỉ báo nhịp làm bài (khoảng 72 giây/câu), đánh dấu câu, gạch bỏ phương án (nút hoặc chuột phải), bảng câu hỏi, màn hình xem lại trước khi nộp, máy tính.
- **Luyện tập theo chuyên đề**: chọn section và số câu, xem đáp án và giải thích (kèm căn cứ GIAS) ngay sau mỗi câu.
- **Ôn câu sai**: mọi câu làm sai được lưu lại, làm đúng thì tự xóa khỏi danh sách.
- **Học lý thuyết**: một bài học cho mỗi chủ đề syllabus (tóm tắt, ý chính, thuật ngữ Anh - Việt, bẫy thường gặp, căn cứ), luyện riêng câu hỏi của chủ đề, tỷ lệ đúng theo chủ đề, đánh dấu đã học và tiến độ; kèm thẻ kiến thức theo section.
- **Ngân hàng câu hỏi**: tìm kiếm, lọc theo section, nhập và xuất JSON (câu nhập chỉ lưu trong trình duyệt).
- **Kết quả**: điểm theo từng section, gợi ý phần cần ôn, xem lại đáp án; lịch sử làm bài.
- Bài đang làm được lưu tự động; tải lại trang vẫn tiếp tục được. Phím tắt: `1-4` hoặc `A-D` chọn đáp án, `mũi tên trái/phải` chuyển câu, `F` đánh dấu, `Enter` kiểm tra (khi luyện tập).
- Giao diện sáng/tối, dùng tốt trên điện thoại.

## Cấu trúc thư mục

```
public/data/                  <- DỮ LIỆU (tách riêng khỏi giao diện)
  parts.json                  danh sách phần thi, thang điểm, nguồn syllabus
  guide.json                  nội dung trang Tìm hiểu CIA
  p1/manifest.json            số câu, thời gian, section, tỷ trọng, chủ đề syllabus
  p1/questions-A.json ...     câu hỏi, mỗi section một file
  p1/lessons.json             bài học, mỗi chủ đề syllabus một bài
  p1/study.json               thẻ kiến thức
  p2/ ...  p3/ ...
src/                          <- GIAO DIỆN (React + Vite)
  lib/exam.js                 rút đề theo tỷ trọng, xáo đáp án, chấm điểm (có unit test)
  lib/validate.js             kiểm tra cấu trúc câu hỏi (dùng chung cho app và script)
  lib/data.js, storage.js     tải dữ liệu, lưu tiến độ trong trình duyệt
  components/                 Home, PartPage, Session (phòng thi), Results, Study, Bank, Calculator
scripts/
  validate.mjs                kiểm tra toàn bộ dữ liệu, chạy tự động trước mỗi lần build
  add-questions.mjs           thêm câu hỏi (hoặc --lessons, --study) từ file JSON
  migrate-legacy.mjs          (một lần) chuyển dữ liệu từ bản HTML cũ
legacy/cia-part1-legacy.html  bản HTML ban đầu, giữ để đối chiếu
```

## Định dạng câu hỏi

```json
{
  "id": "P1-A-051",
  "section": "A",
  "topic": "A3",
  "difficulty": 2,
  "stem": "Nội dung câu hỏi...",
  "options": ["Phương án 1", "Phương án 2", "Phương án 3", "Phương án 4"],
  "answer": 2,
  "explanation": "Giải thích tổng quát, kèm căn cứ...",
  "optionNotes": [
    "Sai. Vì sao phương án 1 sai...",
    "Sai. Vì sao phương án 2 sai...",
    "Đúng. Vì sao phương án 3 đúng...",
    "Sai. Vì sao phương án 4 sai..."
  ],
  "refs": ["GIAS 6.2"]
}
```

- `answer` là vị trí (0-3) của đáp án đúng trong `options`. Ứng dụng tự xáo thứ tự khi hiển thị.
- `optionNotes` giải thích từng phương án, theo đúng thứ tự `options`, giống cách IIA giải thích câu hỏi mẫu. Mở đầu bằng "Đúng." hoặc "Sai.". Hiện sau khi kiểm tra câu (luyện tập), ở trang kết quả và trong ngân hàng câu hỏi. Thiếu trường này thì `npm run validate` cảnh báo.
- `topic` là mã chủ đề syllabus trong `manifest.json` (ví dụ `A3`).
- `difficulty`: 1 dễ, 2 trung bình, 3 khó.

## Thêm câu hỏi

1. Soạn câu hỏi vào một file JSON (mảng các câu như trên).
2. Chạy `node scripts/add-questions.mjs p1 duong-dan/file.json`. Script chuẩn hóa ký tự, kiểm tra cấu trúc, từ chối id trùng và ghi vào đúng file section.
3. Chạy `npm run validate`.

Bộ kiểm tra (`npm run validate`) sẽ báo lỗi nếu:

- id trùng hoặc nội dung câu hỏi trùng;
- không đủ 4 phương án, hoặc `answer` nằm ngoài khoảng 0-3;
- phần có trạng thái `ready` không đủ câu cho một đề đầy đủ;
- đáp án đúng là phương án dài nhất ở quá 40% số câu. Trong đề thật, chọn phương án dài nhất không giúp đoán đúng.

Nó cũng cảnh báo từng câu có đáp án đúng dài hơn 1,2 lần phương án sai dài nhất.

Mẹo soạn câu sát đề thật: các phương án sai phải hợp lý (là sai lầm thường gặp, nhầm lẫn khái niệm, đúng một nửa), độ dài tương đương đáp án đúng. Tránh phương án vô lý.

## Chạy trên máy

Cần Node.js 22+.

```bash
npm install
```

```bash
npm run dev
```

Lệnh khác:

```bash
npm test          # unit test (vitest)
npm run validate  # kiểm tra dữ liệu
npm run build     # validate + build ra thư mục dist/
npm run preview   # xem bản build tại http://localhost:4173
```

Dữ liệu được tải bằng `fetch`, nên phải chạy qua máy chủ web, không mở trực tiếp file `index.html`.

## Đưa lên mạng

**GitHub Pages (đã cấu hình sẵn):** workflow `.github/workflows/deploy.yml` tự kiểm tra dữ liệu, chạy test, build và deploy mỗi khi push lên nhánh `main`. Lần đầu cần vào **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**. Trang sẽ ở `https://<tài-khoản>.github.io/<tên-repo>/`.

**Host tĩnh khác (Netlify, Vercel, Cloudflare Pages...):** build command `npm run build`, thư mục xuất `dist`. Ứng dụng dùng đường dẫn tương đối và hash routing nên chạy được ở thư mục con hoặc tên miền riêng mà không cần cấu hình thêm.

## Lưu ý

- Câu hỏi được viết mới dựa trên syllabus và Chuẩn mực GIAS, không sao chép đề luyện tập có bản quyền của IIA.
- Câu hỏi và giải thích có thể còn sai sót. Hãy đối chiếu với GIAS và tài liệu chính thức; mở issue nếu phát hiện lỗi.
- Tiến độ học lưu trong `localStorage` của trình duyệt, không gửi đi đâu.
