// Định nghĩa kiểu cho các đối tượng lồng nhau trước

// Kiểu cho các mục trong mảng bioxbio (dựa trên type bạn cung cấp, vì JSON là null)
// Lưu ý: Vì giá trị trong JSON là null, nên nó có thể là null hoặc một mảng trống
// hoặc một mảng các đối tượng này. Chúng ta sẽ dùng kiểu `BioxbioItem[] | null`.
type BioxbioItem = {
  Year: string;
  Impact_factor: string;
};

// Kiểu cho đối tượng "Subject Area and Category"
type SubjectAreaAndCategory = {
  "Field of Research": string; // Cần dấu ngoặc kép vì có khoảng trắng
  Topics: string[]; // Mảng các chuỗi
};

// Kiểu cho đối tượng "Information"
type Information = {
  Homepage: string;
  "How to publish in this journal": string; // Cần dấu ngoặc kép vì có khoảng trắng
  Mail: string;
};

// Kiểu cho các mục trong mảng "SupplementaryTable"
type SupplementaryTableItem = {
  Category: string;
  Year: string;
  Quartile: string;
};

// Định nghĩa type chính cho toàn bộ đối tượng JSON
export type JournalResponse = {
  scimagoLink: string;
  bioxbio: BioxbioItem[] | null; // Giá trị trong JSON là null
  Image: string;
  Image_Context: string;
  Rank: string; // Thêm trường bị thiếu
  Sourceid: string; // Thêm trường bị thiếu
  Title: string; // Giữ lại Title viết hoa
  Type: string;
  Issn: string; // Thêm trường Issn viết thường (có trong JSON)
  SJR: string;
  "SJR Best Quartile": string; // Thêm trường bị thiếu
  "H index": string; // Cần dấu ngoặc kép
  "Total Docs. (2023)": string; // Cần dấu ngoặc kép
  "Total Docs. (3years)": string; // Cần dấu ngoặc kép
  "Total Refs.": string; // Sửa tên key (xóa (2023)) và cần dấu ngoặc kép
  "Total Cites (3years)": string; // Cần dấu ngoặc kép
  "Citable Docs. (3years)": string; // Cần dấu ngoặc kép
  "Cites / Doc. (2years)": string; // Cần dấu ngoặc kép
  "Ref. / Doc.": string; // Sửa tên key (xóa (2023)) và cần dấu ngoặc kép
  "%Female": string; // Sửa tên key (xóa (2023)) và cần dấu ngoặc kép
  Overton: string; // Thêm trường bị thiếu
  SDG: string; // Thêm trường bị thiếu
  Country: string;
  Region: string; // Thêm trường bị thiếu
  Publisher: string;
  Coverage: string; // Thêm trường bị thiếu
  Categories: string; // Thêm trường bị thiếu
  Areas: string; // Thêm trường bị thiếu
  title: string; // Giữ lại title viết thường
  "Subject Area and Category": SubjectAreaAndCategory; // Sử dụng type đã định nghĩa
  ISSN: string; // Giữ lại ISSN viết hoa (có trong JSON)
  Information: Information; // Sử dụng type đã định nghĩa
  Scope?: string;
  "Additional Info"?: string;
  SupplementaryTable: SupplementaryTableItem[]; // Sử dụng type đã định nghĩa
  Thumbnail: string;
};