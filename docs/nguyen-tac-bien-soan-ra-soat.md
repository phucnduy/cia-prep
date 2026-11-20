# Nguyên tắc biên soạn và rà soát câu hỏi

Áp dụng cho mọi câu hỏi mới và mọi lần sửa câu hỏi trên CIA Prep. Mỗi nguyên tắc dưới đây đều xuất phát từ một lỗi đã từng xảy ra trong ngân hàng câu hỏi này hoặc ở các bộ đề khác đã được đối chiếu (các ngân hàng câu hỏi miễn phí và một bộ đề thương mại, tháng 11/2026).

Quy tắc kỹ thuật chi tiết (định dạng dữ liệu, trích dẫn GIAS, thuật ngữ) nằm trong [CLAUDE.md](../CLAUDE.md). Tài liệu này là bản dành cho người soạn và người rà soát.

## 1. Câu hỏi tốt gồm những gì

Một câu hỏi đạt chuẩn có đủ năm phần:

| Phần | Yêu cầu |
|---|---|
| Đề bài | Tình huống ngắn, cụ thể; hỏi "phù hợp nhất", "chủ yếu", "trước tiên"... Không ghi số hiệu chuẩn mực (được nêu tên "Theo GIAS" khi đáp án dựa trên yêu cầu bắt buộc). |
| 4 phương án | Đúng một phương án bảo vệ được. Ba phương án sai đều hợp lý với người chưa nắm chắc. Độ dài tương đương nhau. |
| Giải thích | Vì sao đáp án đúng, kèm nguồn (GIAS, COSO, ISO 31000, ACFE...). |
| Ghi chú từng phương án | Mỗi phương án sai: **vì sao sai** và **cách hiểu đúng là gì**, một đến hai câu, từ 45 ký tự trở lên. |
| Thông tin phân loại | Chủ đề, độ khó, nguồn tham chiếu, và ngộ nhận (`trap`) nếu là câu bẫy. |

## 2. Viết phương án sai (phương án nhiễu)

Phương án nhiễu tốt nhất là một ý **nghe hợp lý nhưng không trả lời đúng câu hỏi**. Các dạng nên dùng:

1. **Nhầm vai trò**: HĐQT với Ban điều hành; báo cáo hành chính với báo cáo chức năng; kiểm toán nội bộ làm thay việc của quản lý.
2. **Nhầm nguyên nhân với hậu quả**: vi phạm vệ sinh là nguyên nhân (rủi ro hoạt động), mất khách là hậu quả (rủi ro uy tín).
3. **Đúng nhưng thứ yếu**: một hệ quả có thật nhưng không phải điều "chủ yếu" mà câu hỏi hỏi.
4. **Sai thứ tự**: một hành động đúng nhưng làm ở bước sau (báo HĐQT trước khi báo Ban điều hành cấp cao).
5. **Tuyệt đối hóa**: "bảo đảm tuyệt đối", "không bao giờ", "mọi trường hợp".
6. **Nhầm khái niệm gần nhau**: rủi ro tiềm tàng và rủi ro còn lại; giám sát liên tục và kiểm toán liên tục; RTO và RPO.
7. **Lẫn chuẩn mực cũ**: một quy định của IPPF 2017 đã được GIAS 2024 thay đổi.

**Không dùng** phương án vô lý, ai cũng loại được. Ví dụ đã gặp và đã sửa:

- "Khó in ấn và lưu trữ", "dữ liệu bằng tiếng Anh", "kiểm toán viên làm quá nhiều giờ";
- một loại rủi ro không liên quan gì đến tình huống (lãi suất, tỷ giá trong câu về chuỗi cung ứng);
- "không cần làm gì vì CAE chịu trách nhiệm toàn bộ".

## 3. Viết ghi chú cho từng phương án

Người học học nhiều nhất khi đọc vì sao mình chọn sai. Mỗi ghi chú phương án sai phải trả lời được câu hỏi: "Tôi đã nghĩ sai ở đâu?"

| Chưa đạt | Đạt |
|---|---|
| Sai. Quá tuyệt đối. | Sai. Sai sót được che giấu bằng thông đồng và làm giả tinh vi có thể không bị phát hiện dù kiểm toán viên đủ năng lực và thận trọng. |
| Sai. Đây là kiểm soát phòng ngừa. | Sai. Mật khẩu mạnh ngăn truy cập trái phép trước khi xảy ra, nên là kiểm soát phòng ngừa, không phải khắc phục. |
| Sai. Chi phí thứ yếu. | Sai. Chi phí tuyển dụng là hệ quả nhỏ; ảnh hưởng đáng lo nhất là răn đe gian lận bị suy yếu trong toàn công ty. |

Ghi chú bắt đầu bằng "Đúng." hoặc "Sai.". Không nhắc chữ cái hay vị trí phương án, vì thứ tự phương án được xáo trộn mỗi lần làm bài.

## 4. Câu bẫy và độ khó

- **Câu bẫy**: phương án nhiễu hấp dẫn nhất là một ngộ nhận phổ biến (mục 2). Vẫn chỉ có một đáp án bảo vệ được; bẫy về kiến thức, không bẫy chơi chữ. Ghi ngộ nhận vào trường `trap`; trang luyện tập hiện nó sau khi bấm Kiểm tra. Mỗi lô câu mới có ít nhất 60% câu bẫy.
- **Độ khó**: Dễ (nhớ một quy tắc), Trung bình (áp dụng một quy tắc vào tình huống), Khó (phán đoán giữa nhiều hành động hợp lý, kết hợp nhiều quy tắc, hoặc sắc thái như "được cảm nhận" và "thực tế"). Câu dễ tối đa 10% mỗi phần; câu khó nhắm khoảng 40%.

## 5. Nguồn và độ chính xác

- Mọi trích dẫn GIAS phải đối chiếu nguyên văn trước khi viết (`node scripts/gias-req.mjs 9.5`). Không dẫn từ trí nhớ.
- Tách bạch GIAS 2024 và IPPF 2017. Một bộ đề thương mại bản 2025 vẫn còn ý của IPPF 2017 (HĐQT "phê duyệt" lương thưởng CAE; câu về "sự kiện trọng yếu" diễn đạt theo Quy tắc đạo đức cũ). Ý cũ diễn đạt bằng lời, không kèm số hiệu, là loại lỗi khó phát hiện nhất.
- Phân biệt suy giảm **tính độc lập của bộ phận** (GIAS 7.1) với suy giảm **tính khách quan của cá nhân** (GIAS 2.3).
- Thuật ngữ tiếng Việt theo Nghị định 05/2019/NĐ-CP: Quy chế kiểm toán nội bộ, bộ phận kiểm toán nội bộ, kiến nghị, hồ sơ kiểm toán, chương trình kiểm toán. Giữ chữ viết tắt CAE.
- Câu hỏi là câu tự soạn. Không chép hay diễn đạt lại câu của IIA hay của bộ đề khác.

## 6. Quy trình rà soát

### 6.1 Danh mục rà soát từng câu

Người rà soát đọc câu như một thí sinh, rồi kiểm tra:

1. Có đúng **một** đáp án bảo vệ được không? Thử bảo vệ từng phương án sai; nếu bảo vệ được thì phải sửa.
2. Mỗi phương án sai có hợp lý với người chưa nắm chắc không? Có phương án nào ai cũng loại được không?
3. Đáp án có bị lộ không? Các dấu hiệu gồm:
   - đáp án dài hoặc ngắn hơn hẳn các phương án khác;
   - chỉ đáp án có trích dẫn chuẩn mực;
   - một câu khác trong ngân hàng có cùng tình huống hoặc cùng đáp án.
4. Trích dẫn và nội dung có khớp nguyên văn chuẩn mực không? Có lẫn IPPF 2017 không?
5. Ghi chú từng phương án có nói được vì sao sai và cách hiểu đúng không?
6. Độ khó và trường `trap` có đúng với điều người học phải làm không?
7. Thuật ngữ có theo Nghị định 05/2019 không? Có ký tự đặc biệt (gạch dài, ngoặc cong) không?

### 6.2 Công cụ tự động

| Công cụ | Kiểm tra gì |
|---|---|
| `node scripts/batch-check.mjs <part> <file>` | Trước khi thêm lô câu mới: cân vị trí đáp án; đáp án dài hoặc ngắn bất thường; ghi chú lệch đáp án; câu gần trùng hoặc lộ đáp án của nhau. |
| `npm run validate` | Mọi lần build: cấu trúc dữ liệu; số hiệu GIAS có thật; nhắc chữ cái phương án; tỷ lệ đáp án dài nhất (tối đa 40%); câu dễ (tối đa 10%); ghi chú phương án sai dưới 45 ký tự; thuật ngữ cũ. |
| `npm run audit:bank` | Định kỳ: tỷ lệ độ khó, tỷ lệ câu bẫy, câu tình huống, chủ đề còn mỏng. |
| `node scripts/review-notes.mjs list` | Liệt kê câu có ghi chú dưới chuẩn để rà soát. `apply` áp dụng chỉnh sửa mà không động vào đáp án đúng. |

Máy chỉ bắt được lỗi hình thức. Các mục 1, 2, 4 và 6 trong danh mục rà soát vẫn phải do người đọc từng câu.

### 6.3 Khi nào rà soát

- **Mỗi lô câu mới**: người soạn tự rà theo danh mục, chạy hai công cụ đầu, rồi mới thêm vào ngân hàng.
- **Định kỳ**: chạy `audit:bank`; đọc lại một mẫu ngẫu nhiên khoảng 20 câu mỗi phần để tìm loại lỗi mà máy không bắt được.
- **Khi chuẩn mực hoặc syllabus thay đổi**: rà lại các câu có trích dẫn liên quan.
- **Trước khi công bố đánh giá chất lượng**: ghi rõ cái gì đã đối chiếu nguyên văn, cái gì viết theo hiểu biết chung. Nội dung hiện chưa được người có chứng chỉ CIA rà soát.
