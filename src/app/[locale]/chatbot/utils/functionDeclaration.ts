import {
    FunctionDeclaration,
    SchemaType,
} from "@google/generative-ai";

export const english_getConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // Mô tả rõ mục đích là tạo query string
    description: "Generates a URL-encoded query string to search for conferences based on user-specified criteria. This query string will be used to fetch data from the backend API." +
        " It is crucial that *all* values in the query string are properly URL-encoded to ensure the backend API correctly interprets the search criteria. Failure to properly encode values can lead to incorrect search results or errors." +
        " Be mindful of the maximum length of a URL, as excessively long query strings may be truncated by browsers or servers. Consider limiting the number of `topics` or `researchFields` parameters if necessary." +
        " The backend API may be case-sensitive for certain parameters (e.g., `country`, `continent`). Ensure the casing of the values matches the expected format." +
        " A comprehensive example combining multiple criteria: `title=International+Conference+on+AI&topics=AI&topics=Machine+Learning&country=USA&fromDate=2024-01-01&toDate=2024-12-31&rank=A*`",
    parameters: {
        type: SchemaType.OBJECT, // Vẫn là OBJECT theo cấu trúc chung
        properties: {
            // Định nghĩa một tham số duy nhất để chứa query string
            searchQuery: {
                type: SchemaType.STRING,
                // Hướng dẫn chi tiết cách tạo query string
                description: "A URL-encoded query string constructed from the user's search criteria for conferences. Format as key=value pairs separated by '&'. " +
                    "Available keys based on potential user queries include: " +
                    "`title` (string):  The full, formal name of the conference.(e.g., International Conference on Management of Digital EcoSystems) " +
                    "`acronym` (string): The abbreviated name of the conference, often represented by capital letters (e.g., ICCCI, SIGGRAPH, ABZ). " +
                    "`fromDate` (string, e.g., YYYY-MM-DD), " +
                    "`toDate` (string, e.g., YYYY-MM-DD), " +
                    "`topics` (string, repeat key for multiple values, e.g., topics=AI&topics=ML), " +
                    "`cityStateProvince` (string), " +
                    "`country` (string), " +
                    "`continent` (string), " +
                    "`address` (string), " +
                    "`researchFields` (string, repeat key for multiple values), " +
                    "`rank` (string), " +
                    "`source` (string), " +
                    "`accessType` (string), " +
                    "`keyword` (string), " +
                    "`subFromDate` (string), `subToDate` (string), " +
                    "`cameraReadyFromDate` (string), `cameraReadyToDate` (string), " +
                    "`notificationFromDate` (string), `notificationToDate` (string), " +
                    "`registrationFromDate` (string), `registrationToDate` (string), " +
                    "`mode` (string): If the user requests detailed information, the value is always `detail`. " +
                    "`perPage` (number):  The number of conferences to return per page. If the user specifies a number, use that value. If the user doesn't specify a number, default to 5." +
                    "`page` (number):  The page number of the results to return. If the user wants to see the next set of conferences, use page=2, page=3, etc. If the user doesn't specify a page number, default to 1." +
                    "Ensure all values are properly URL-encoded (e.g., spaces become + or +). " +

                    "**Distinguishing between Title and Acronym:** It is crucial to correctly identify whether the user is providing the full conference title or the acronym.  Here's how to differentiate them:" +
                    "* **Title:** This is the complete, unabbreviated name of the conference.  It is typically a phrase or sentence that describes the conference's focus. Example: 'International Conference on Machine Learning'.  Use the `title` parameter for this." +
                    "* **Acronym:** This is a short, usually capitalized, abbreviation of the conference name. Example: 'ICML' (for International Conference on Machine Learning).  Use the `acronym` parameter for this." +

                    "**Examples:**" +
                    "* User query: 'Find conferences about ICML'.  `searchQuery=acronym=ICML&perPage=5&page=1` (Default perPage and page)" +
                    "* User query: 'Search for the International Conference on Management of Digital EcoSystems'. `searchQuery=title=International+Conference+on+Management+of+Digital+EcoSystems&perPage=5&page=1` (Default perPage and page)" +
                    "* User query: 'Find MEDES conferences'. `searchQuery=acronym=MEDES&perPage=5&page=1` (Default perPage and page)" +
                    "* User query: 'Search for conferences with the full name International Conference on Recent Trends in Image Processing, Pattern Recognition and Machine Learning'. `searchQuery=title=International+Conference+on+Recent+Trends+in+Image+Processing,+Pattern+Recognition+and+Machine+Learning&perPage=5&page=1` (Default perPage and page)" +
                    "* User query 1: 'Find 3 conferences in USA'. `searchQuery=country=USA&perPage=3&page=1` User query 2: 'Find 5 different conferences in USA'. `searchQuery=country=USA&perPage=5&page=2`" +

                    "For example, if a topic contains both spaces and special characters, like 'Data Science & Analysis', it should be encoded as 'Data+Science+&+Analysis'. " +
                    "If a user doesn't specify a value for a particular key, it should be omitted entirely from the query string.  Do not include keys with empty values (e.g., `title=`). " +
                    "To specify multiple topics or research fields, repeat the key for each value. For example: `topics=AI&topics=Machine+Learning&researchFields=Computer+Vision&researchFields=Natural+Language+Processing`. " +
                    "Always URL-encode special characters in values. For example, use `+` for spaces, `&` for ampersands, `=` for equals signs, and `+` for plus signs. " +
                    "To search for conferences between two dates, use `fromDate` and `toDate`. For example, to search for conferences happening between January 1, 2023, and December 31, 2023, use `fromDate=2023-01-01&toDate=2023-12-31`. " +
                    "If the user requests *detailed* information about the conferences (e.g., full descriptions, specific dates, call for papers, summary, etc.), include the parameter `mode=detail` in the query string."
            }
        },
        // Đảm bảo Gemini luôn cung cấp tham số này
        required: ["searchQuery"]
    }
};

export const english_getJournalsDeclaration: FunctionDeclaration = {
    name: "getJournals",
    description: "Retrieves information about journals based on filtering criteria.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            "Rank": {
                "type": SchemaType.ARRAY,
                "description": "List of journal ranks to filter by.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "Title": {
                "type": SchemaType.ARRAY,
                "description": "List of journal titles to filter by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Issn": {
                "type": SchemaType.ARRAY,
                "description": "List of journal ISSNs to filter by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "SJR": {
                "type": SchemaType.ARRAY,
                "description": "List of journal SJR values to filter by.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SJRBestQuartile": {
                "type": SchemaType.ARRAY,
                "description": "List of journal SJR Best Quartile values to filter by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "HIndex": {
                "type": SchemaType.INTEGER,
                "description": "Journal H index to filter by."
            },
            "Country": {
                "type": SchemaType.ARRAY,
                "description": "List of countries to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Region": {
                "type": SchemaType.ARRAY,
                "description": "List of regions to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Publisher": {
                "type": SchemaType.ARRAY,
                "description": "List of publishers to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Areas": {
                "type": SchemaType.ARRAY,
                "description": "List of areas to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Categories": {
                "type": SchemaType.ARRAY,
                "description": "List of categories to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Overton": {
                "type": SchemaType.ARRAY,
                "description": "List of Overton values to filter journals by.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SDG": {
                "type": SchemaType.ARRAY,
                "description": "List of SDGs to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            }
        }
    },
};

export const english_getWebsiteInformationDeclaration: FunctionDeclaration = {
    name: "getWebsiteInformation",
    description: "Retrieves information about websites. This function don't need parameters, just call it"
};

export const english_drawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "Draws a chart based on the provided data.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                description: "The type of chart (e.g., bar, line, pie).",
            }
        },
        required: ["chartType"],
    },
};

export const vietnam_getConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // Mô tả rõ mục đích là tạo query string
    description: "Tạo một chuỗi truy vấn được mã hóa URL để tìm kiếm hội nghị dựa trên tiêu chí do người dùng chỉ định. Chuỗi truy vấn này sẽ được sử dụng để lấy dữ liệu từ API backend." +
        " Điều cực kỳ quan trọng là *tất cả* các giá trị trong chuỗi truy vấn phải được mã hóa URL đúng cách để đảm bảo API backend diễn giải chính xác các tiêu chí tìm kiếm. Việc không mã hóa đúng cách các giá trị có thể dẫn đến kết quả tìm kiếm sai hoặc lỗi." +
        " Lưu ý về độ dài tối đa của URL, vì các chuỗi truy vấn quá dài có thể bị cắt bớt bởi trình duyệt hoặc máy chủ. Cân nhắc giới hạn số lượng tham số `topics` hoặc `researchFields` nếu cần." +
        " API backend có thể phân biệt chữ hoa chữ thường đối với một số tham số (ví dụ: `country`, `continent`). Đảm bảo kiểu chữ hoa/thường của các giá trị khớp với định dạng mong đợi." +
        " Một ví dụ toàn diện kết hợp nhiều tiêu chí: `title=International+Conference+on+AI&topics=AI&topics=Machine+Learning&country=USA&fromDate=2024-01-01&toDate=2024-12-31&rank=A*`",
    parameters: {
        type: SchemaType.OBJECT, // Vẫn là OBJECT theo cấu trúc chung
        properties: {
            // Định nghĩa một tham số duy nhất để chứa query string
            searchQuery: {
                type: SchemaType.STRING,
                // Hướng dẫn chi tiết cách tạo query string
                description: "Một chuỗi truy vấn được mã hóa URL được xây dựng từ tiêu chí tìm kiếm hội nghị của người dùng. Định dạng dưới dạng các cặp key=value được phân tách bằng dấu '&'. " +
                    "Các khóa (key) có sẵn dựa trên các truy vấn tiềm năng của người dùng bao gồm: " +
                    "`title` (string): Tên đầy đủ, chính thức của hội nghị (ví dụ: International Conference on Management of Digital EcoSystems). " +
                    "`acronym` (string): Tên viết tắt của hội nghị, thường được biểu thị bằng chữ in hoa (ví dụ: ICCCI, SIGGRAPH, ABZ). " +
                    "`fromDate` (string, ví dụ: YYYY-MM-DD - Năm-Tháng-Ngày), " +
                    "`toDate` (string, ví dụ: YYYY-MM-DD - Năm-Tháng-Ngày), " +
                    "`topics` (string, lặp lại khóa cho nhiều giá trị, ví dụ: topics=AI&topics=ML - chủ đề=AI&chủ đề=ML), " +
                    "`cityStateProvince` (string): Thành phố/Bang/Tỉnh, " +
                    "`country` (string): Quốc gia, " +
                    "`continent` (string): Lục địa, " +
                    "`address` (string): Địa chỉ, " +
                    "`researchFields` (string, lặp lại khóa cho nhiều giá trị): Lĩnh vực nghiên cứu, " +
                    "`rank` (string): Hạng (ví dụ: A*, A, B, C), " +
                    "`source` (string): Nguồn (ví dụ: CORE, Scopus), " +
                    "`accessType` (string): Loại truy cập (ví dụ: Open Access), " +
                    "`keyword` (string): Từ khóa, " +
                    "`subFromDate` (string): Ngày bắt đầu nộp bài, `subToDate` (string): Ngày kết thúc nộp bài, " +
                    "`cameraReadyFromDate` (string): Ngày bắt đầu nộp bản hoàn chỉnh, `cameraReadyToDate` (string): Ngày kết thúc nộp bản hoàn chỉnh, " +
                    "`notificationFromDate` (string): Ngày bắt đầu thông báo chấp nhận, `notificationToDate` (string): Ngày kết thúc thông báo chấp nhận, " +
                    "`registrationFromDate` (string): Ngày bắt đầu đăng ký, `registrationToDate` (string): Ngày kết thúc đăng ký, " +
                    "`mode` (string): Nếu người dùng yêu cầu thông tin chi tiết, giá trị luôn là `detail`. " +
                    "`perPage` (number): Số lượng hội nghị trả về mỗi trang. Nếu người dùng chỉ định một số, hãy sử dụng giá trị đó. Nếu người dùng không chỉ định số, mặc định là 5." +
                    "`page` (number): Số trang của kết quả trả về. Nếu người dùng muốn xem bộ hội nghị tiếp theo, sử dụng page=2, page=3, v.v. Nếu người dùng không chỉ định số trang, mặc định là 1." +
                    "Đảm bảo tất cả các giá trị được mã hóa URL đúng cách (ví dụ: dấu cách trở thành + hoặc +). " +

                    "**Phân biệt giữa Tiêu đề (Title) và Tên viết tắt (Acronym):** Điều quan trọng là phải xác định chính xác liệu người dùng đang cung cấp tiêu đề đầy đủ của hội nghị hay tên viết tắt. Dưới đây là cách phân biệt chúng:" +
                    "* **Tiêu đề (Title):** Đây là tên đầy đủ, không viết tắt của hội nghị. Nó thường là một cụm từ hoặc câu mô tả trọng tâm của hội nghị. Ví dụ: 'International Conference on Machine Learning'. Sử dụng tham số `title` cho trường hợp này." +
                    "* **Tên viết tắt (Acronym):** Đây là một chữ viết tắt ngắn gọn, thường được viết hoa, của tên hội nghị. Ví dụ: 'ICML' (cho International Conference on Machine Learning). Sử dụng tham số `acronym` cho trường hợp này." +

                    "**Ví dụ:**" +
                    "* Truy vấn người dùng: 'Tìm hội nghị về ICML'. `searchQuery=acronym=ICML&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng: 'Tìm kiếm International Conference on Management of Digital EcoSystems'. `searchQuery=title=International+Conference+on+Management+of+Digital+EcoSystems&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng: 'Tìm hội nghị MEDES'. `searchQuery=acronym=MEDES&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng: 'Tìm kiếm hội nghị có tên đầy đủ là International Conference on Recent Trends in Image Processing, Pattern Recognition and Machine Learning'. `searchQuery=title=International+Conference+on+Recent+Trends+in+Image+Processing,+Pattern+Recognition+and+Machine+Learning&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng 1: 'Tìm 3 hội nghị ở Mỹ'. `searchQuery=country=USA&perPage=3&page=1` Truy vấn người dùng 2: 'Tìm 5 hội nghị khác ở Mỹ'. `searchQuery=country=USA&perPage=5&page=2`" +

                    "Ví dụ: nếu một chủ đề chứa cả dấu cách và ký tự đặc biệt, như 'Data Science & Analysis', nó nên được mã hóa thành 'Data+Science+&+Analysis'. " +
                    "Nếu người dùng không chỉ định giá trị cho một khóa cụ thể, nó nên được bỏ hoàn toàn khỏi chuỗi truy vấn. Không bao gồm các khóa có giá trị rỗng (ví dụ: `title=`). " +
                    "Để chỉ định nhiều chủ đề hoặc lĩnh vực nghiên cứu, hãy lặp lại khóa cho mỗi giá trị. Ví dụ: `topics=AI&topics=Machine+Learning&researchFields=Computer+Vision&researchFields=Natural+Language+Processing`. " +
                    "Luôn mã hóa URL các ký tự đặc biệt trong giá trị. Ví dụ: sử dụng `+` cho dấu cách, `&` cho dấu và, `=` cho dấu bằng, và `+` cho dấu cộng. " +
                    "Để tìm kiếm hội nghị giữa hai ngày, hãy sử dụng `fromDate` và `toDate`. Ví dụ, để tìm kiếm các hội nghị diễn ra từ ngày 1 tháng 1 năm 2023 đến ngày 31 tháng 12 năm 2023, sử dụng `fromDate=2023-01-01&toDate=2023-12-31`. " +
                    "Nếu người dùng yêu cầu thông tin *chi tiết* về các hội nghị (ví dụ: mô tả đầy đủ, ngày cụ thể, lời mời nộp bài, tóm tắt, v.v.), hãy bao gồm tham số `mode=detail` trong chuỗi truy vấn."
            }
        },
        // Đảm bảo Gemini luôn cung cấp tham số này
        required: ["searchQuery"]
    }
};

export const vietnam_getJournalsDeclaration: FunctionDeclaration = {
    name: "getJournals",
    description: "Truy xuất thông tin về các tạp chí dựa trên tiêu chí lọc.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            "Rank": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các hạng tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "Title": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các tiêu đề tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Issn": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các mã ISSN của tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "SJR": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các giá trị SJR của tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SJRBestQuartile": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các giá trị Phân vị Tốt nhất SJR (SJR Best Quartile) của tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.STRING // Có thể là Q1, Q2, Q3, Q4
                }
            },
            "HIndex": {
                "type": SchemaType.INTEGER,
                "description": "Chỉ số H (H index) của tạp chí để lọc theo."
            },
            "Country": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các quốc gia để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Region": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các khu vực để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Publisher": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các nhà xuất bản để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Areas": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các lĩnh vực (areas) để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Categories": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các danh mục (categories) để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Overton": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các giá trị Overton để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SDG": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các Mục tiêu Phát triển Bền vững (SDGs) để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING // Thường là số hoặc mã của SDG
                }
            }
        }
    },
};

export const vietnam_getWebsiteInformationDeclaration: FunctionDeclaration = {
    name: "getWebsiteInformation",
    description: "Truy xuất thông tin về trang web. Hàm này không cần tham số, chỉ cần gọi nó."
};

export const vietnam_drawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "Vẽ biểu đồ dựa trên dữ liệu được cung cấp.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                description: "Loại biểu đồ (ví dụ: bar (cột), line (đường), pie (tròn)).",
            }
        },
        required: ["chartType"],
    },
};

export const china_getConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // 描述：清晰说明目的是创建查询字符串
    description: "根据用户指定的标准生成用于搜索会议的 URL 编码查询字符串。此查询字符串将用于从后端 API 获取数据。" +
        " 至关重要的是，查询字符串中的 *所有* 值都必须经过正确的 URL 编码，以确保后端 API 正确解释搜索条件。未能正确编码值可能导致错误的搜索结果或错误。" +
        " 请注意 URL 的最大长度，因为过长的查询字符串可能会被浏览器或服务器截断。如有必要，请考虑限制 `topics` 或 `researchFields` 参数的数量。" +
        " 后端 API 对某些参数（例如 `country`、`continent`）可能区分大小写。请确保值的字母大小写与预期格式匹配。" +
        " 一个结合多个标准的综合示例：`title=International+Conference+on+AI&topics=AI&topics=Machine+Learning&country=USA&fromDate=2024-01-01&toDate=2024-12-31&rank=A*`",
    parameters: {
        type: SchemaType.OBJECT, // 仍然是 OBJECT 以符合通用结构
        properties: {
            // 定义一个单一参数来包含查询字符串
            searchQuery: {
                type: SchemaType.STRING,
                // 描述：关于如何创建查询字符串的详细说明
                description: "根据用户的会议搜索标准构建的 URL 编码查询字符串。格式为以 '&' 分隔的 key=value 对。" +
                    "基于潜在用户查询的可用键包括：" +
                    "`title` (string): 会议的完整正式名称（例如：International Conference on Management of Digital EcoSystems）。" +
                    "`acronym` (string): 会议的缩写名称，通常用大写字母表示（例如：ICCCI, SIGGRAPH, ABZ）。" +
                    "`fromDate` (string, 例如：YYYY-MM-DD - 年-月-日), " +
                    "`toDate` (string, 例如：YYYY-MM-DD - 年-月-日), " +
                    "`topics` (string, 对于多个值重复键，例如：topics=AI&topics=ML - 主题=AI&主题=ML), " +
                    "`cityStateProvince` (string): 城市/州/省, " +
                    "`country` (string): 国家, " +
                    "`continent` (string): 大洲, " +
                    "`address` (string): 地址, " +
                    "`researchFields` (string, 对于多个值重复键): 研究领域, " +
                    "`rank` (string): 排名 (例如: A*, A, B, C), " +
                    "`source` (string): 来源 (例如: CORE, Scopus), " +
                    "`accessType` (string): 访问类型 (例如: Open Access - 开放获取), " +
                    "`keyword` (string): 关键词, " +
                    "`subFromDate` (string): 投稿开始日期, `subToDate` (string): 投稿截止日期, " +
                    "`cameraReadyFromDate` (string): 终稿提交开始日期, `cameraReadyToDate` (string): 终稿提交截止日期, " +
                    "`notificationFromDate` (string): 录用通知开始日期, `notificationToDate` (string): 录用通知截止日期, " +
                    "`registrationFromDate` (string): 注册开始日期, `registrationToDate` (string): 注册截止日期, " +
                    "`mode` (string): 如果用户请求详细信息，值始终为 `detail`。" +
                    "`perPage` (number): 每页返回的会议数量。如果用户指定了数量，则使用该值。如果用户未指定数量，则默认为 5。" +
                    "`page` (number): 要返回的结果页码。如果用户想查看下一组会议，请使用 page=2, page=3 等。如果用户未指定页码，则默认为 1。" +
                    "确保所有值都经过正确的 URL 编码（例如，空格变成 + 或 +）。" +

                    "**区分标题 (Title) 和缩写 (Acronym):** 正确识别用户提供的是完整的会议标题还是缩写至关重要。区分方法如下：" +
                    "* **标题 (Title):** 这是会议的完整、未缩写的名称。它通常是一个描述会议重点的短语或句子。示例：'International Conference on Machine Learning'。对此使用 `title` 参数。" +
                    "* **缩写 (Acronym):** 这是会议名称的简短、通常大写的缩写。示例：'ICML' (代表 International Conference on Machine Learning)。对此使用 `acronym` 参数。" +

                    "**示例:**" +
                    "* 用户查询：'查找关于 ICML 的会议'。 `searchQuery=acronym=ICML&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询：'搜索 International Conference on Management of Digital EcoSystems'。 `searchQuery=title=International+Conference+on+Management+of+Digital+EcoSystems&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询：'查找 MEDES 会议'。 `searchQuery=acronym=MEDES&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询：'搜索全称为 International Conference on Recent Trends in Image Processing, Pattern Recognition and Machine Learning 的会议'。 `searchQuery=title=International+Conference+on+Recent+Trends+in+Image+Processing,+Pattern+Recognition+and+Machine+Learning&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询 1: '查找美国的 3 个会议'。 `searchQuery=country=USA&perPage=3&page=1` 用户查询 2: '查找美国的另外 5 个会议'。 `searchQuery=country=USA&perPage=5&page=2`" +

                    "例如，如果一个主题同时包含空格和特殊字符，如 'Data Science & Analysis'，则应编码为 'Data+Science+&+Analysis'。" +
                    "如果用户未为特定键指定值，则应将其完全从查询字符串中省略。不要包含值为空的键（例如 `title=`）。" +
                    "要指定多个主题或研究领域，请为每个值重复该键。例如：`topics=AI&topics=Machine+Learning&researchFields=Computer+Vision&researchFields=Natural+Language+Processing`。" +
                    "始终对值中的特殊字符进行 URL 编码。例如，使用 `+` 表示空格，`&` 表示 & 符号，`=` 表示等号，`+` 表示加号。" +
                    "要搜索两个日期之间的会议，请使用 `fromDate` 和 `toDate`。例如，要搜索 2023 年 1 月 1 日至 2023 年 12 月 31 日之间举行的会议，请使用 `fromDate=2023-01-01&toDate=2023-12-31`。" +
                    "如果用户请求有关会议的 *详细* 信息（例如，完整描述、具体日期、征稿启事、摘要等），请在查询字符串中包含参数 `mode=detail`。"
            }
        },
        // 描述：确保 Gemini 始终提供此参数
        required: ["searchQuery"]
    }
};

export const china_getJournalsDeclaration: FunctionDeclaration = {
    name: "getJournals",
    description: "根据筛选条件检索期刊信息。",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            "Rank": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊排名列表。",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "Title": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊标题列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Issn": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊 ISSN 列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "SJR": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊 SJR 值列表。",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SJRBestQuartile": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊 SJR 最佳分区 (SJR Best Quartile) 值列表。",
                "items": {
                    "type": SchemaType.STRING // 可能是 Q1, Q2, Q3, Q4
                }
            },
            "HIndex": {
                "type": SchemaType.INTEGER,
                "description": "用于筛选的期刊 H 指数 (H index)。"
            },
            "Country": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的国家列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Region": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的地区列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Publisher": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的出版商列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Areas": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的领域 (areas) 列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Categories": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的类别 (categories) 列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Overton": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的 Overton 值列表。",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SDG": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的可持续发展目标 (SDGs) 列表。",
                "items": {
                    "type": SchemaType.STRING // 通常是 SDG 的编号或代码
                }
            }
        }
    },
};

export const china_getWebsiteInformationDeclaration: FunctionDeclaration = {
    name: "getWebsiteInformation",
    description: "检索有关网站的信息。此函数不需要参数，直接调用即可。"
};

export const china_drawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "根据提供的数据绘制图表。",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                description: "图表的类型（例如：bar (柱状图), line (折线图), pie (饼图)）。",
            }
        },
        required: ["chartType"],
    },
};

export type Language = 'en' | 'vi' | 'zh'; // Define the language type


export const englishSystemInstructions = `
### ROLE ###
You are HCMUS, a friendly and helpful chatbot specializing in conferences, journals information and the Global Conference & Journal Hub (GCJH) website. You will act as a helpful assistant that can filter information about conferences, journals and website information.

### INSTRUCTIONS ###
1.  **ONLY use information returned by the provided functions ('getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart') to answer user requests.** Do not invent information or use outside knowledge. You will answer user queries based solely on provided data sources: a database of conferences, journals and a description of the GCJH website. Do not access external websites, search engines, or any other external knowledge sources. Your responses should be concise, accurate, and draw only from the provided data. Do not make any assumptions about data not explicitly present in either data source, including temporal limitations.
2.  To fulfill the user's request, you MUST choose the appropriate function: 'getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart'.
3.  If the user's request is unclear, cannot be fulfilled using the provided functions, or is invalid, provide a helpful and informative response, explaining that the request cannot be processed based on the provided function. Do not attempt to answer the question directly without function calls.  If the database lacks sufficient information to answer a question, clearly and politely state this limitation (e.g., 'I'm sorry, I don't have enough information to answer that question.').
4.  **You MUST call ONLY ONE function at a time.**
5.  **You MUST wait for the result of the function call before responding to the user.** Do not respond to the user *before* receiving and processing the function's result.  The response to the user MUST be based on the function's return value.

### RESPONSE REQUIREMENTS ###
*   **Accuracy:** Your responses must be accurate and consistent with the provided database.
*   **Relevance:** Only provide information directly relevant to the user's query.
*   **Conciseness:** Keep your answers brief and to the point.
*   **Clarity:** Use clear and understandable language. Avoid jargon unless the user uses it in their query.
*   **Error Handling:** If the user provides invalid input or requests information not present in the database, respond gracefully. **If you cannot find an exact match for the user's query, respond with 'No conferences found matching your search.' or a similar concise message. Do not attempt to provide partially matching results or explanations. If the database information is incomplete or ambiguous, state this clearly (e.g., 'I cannot answer that question completely because the provided information is missing crucial details').

### Formatting Guidelines ###
*   **Line Breaks:** Use line breaks liberally to separate different pieces of information. Avoid long, unbroken paragraphs.
*   **Bulleted Lists:** Use bulleted lists ('-', or numbered lists) for presenting multiple items (e.g., a list of conferences, important dates).
*   **Bolding and Italics:** Use bolding ('**bold text**') for emphasis and italics ('*italics*') for specific details or to highlight important information (e.g., deadlines).
*   **Consistent Spacing:** Maintain consistent spacing between sections and paragraphs.
*   **Avoid Markdown Conflicts:** If providing information that might conflict with markdown formatting (e.g., dates that could be interpreted as markdown links), escape special characters or use alternative formatting to prevent misinterpretations."

### CONVERSATIONAL FLOW ###
*   **Greetings:** Begin each interaction with a welcoming greeting (e.g., 'Hi there!', 'Hello!', 'Welcome!').
*   **Closings:** End with a closing that expresses willingness to help further (e.g., 'Let me know if you have any other questions!', 'Is there anything else I can help you with?', 'Happy to help further!').
*   **Friendly Phrases:** Use appropriate friendly phrases throughout the conversation (e.g., 'Certainly!', 'Absolutely!', 'Sure thing!', 'Here's what I found:', 'No problem!', 'I understand.', 'That's a great question!', 'Let me see...'). Avoid overuse.
*   **Prohibited Phrases:** Avoid phrases that explicitly reference the database as the source of your information (e.g., 'Based on the provided database...', 'According to the data...', 'The database shows...').

### IMPORTANT CONSIDERATIONS ###
*   **Multiple Matches:** If multiple conferences/journals match the user's criteria, present them all in a structured way.
*   **Partial Matches:** If a user's request is partially ambiguous or contains errors, attempt to understand the intent and provide relevant suggestions, or politely ask for clarification.  **If no exact match is found, do not attempt to offer partial matches; respond with a 'no results' message.**
*   **No Matches:** If no conferences match the user's query, respond with a concise and polite message *without* additional explanations. Acceptable responses include: 'I'm sorry, I couldn't find any conferences matching your criteria.', 'No conferences found matching your search.', 'No results found.'
*   **Large Number of Matches (Over 20):** If provided conferences database or your search yields more than 20 conferences, politely ask the user to provide more specific criteria to narrow down the results. For example, you could say: 'I found over 20 conferences matching your criteria. Could you please provide more details, such as location, date range, or specific keywords, to help me narrow down the search?'
*   **Website Information:** If a user asks a question about the website (e.g., 'How do I register?', 'What are the website's features?', 'What is the privacy policy?'), answer based on the provided website description from 'getWebsiteInformation' function.  If a specific answer cannot be found, state that clearly.
`;

export const vietnameseSystemInstructions = `
### VAI TRÒ ###
Bạn là HCMUS, một chatbot thân thiện và hữu ích chuyên về thông tin hội nghị, tạp chí và trang web Global Conference & Journal Hub (GCJH). Bạn sẽ đóng vai trò như một trợ lý hữu ích có thể lọc thông tin về hội nghị, tạp chí và thông tin trang web và trả lời câu hỏi của người dùng bằng Tiếng Việt một cách thuần thục, điêu luyện và trôi chảy.

### HƯỚNG DẪN ###
1.  **CHỈ** sử dụng thông tin được trả về bởi các hàm được cung cấp ('getConferences', 'getJournals', 'getWebsiteInformation', hoặc 'drawChart') để trả lời yêu cầu của người dùng. **Không** được bịa đặt thông tin hoặc sử dụng kiến thức bên ngoài. Bạn sẽ trả lời các truy vấn của người dùng **chỉ dựa trên** các nguồn dữ liệu được cung cấp: một cơ sở dữ liệu về hội nghị, tạp chí và mô tả về trang web GCJH. **Không** được truy cập các trang web bên ngoài, công cụ tìm kiếm hoặc bất kỳ nguồn kiến thức bên ngoài nào khác. Phản hồi của bạn phải ngắn gọn, chính xác và chỉ lấy từ dữ liệu được cung cấp. **Không** được đưa ra bất kỳ giả định nào về dữ liệu không có sẵn rõ ràng trong nguồn dữ liệu, bao gồm cả các giới hạn về thời gian.
2.  Để đáp ứng yêu cầu của người dùng, bạn **PHẢI** chọn hàm phù hợp: 'getConferences', 'getJournals', 'getWebsiteInformation', hoặc 'drawChart'.
3.  Nếu yêu cầu của người dùng không rõ ràng, không thể thực hiện được bằng các hàm được cung cấp, hoặc không hợp lệ, hãy cung cấp một phản hồi hữu ích và đầy đủ thông tin, giải thích rằng yêu cầu không thể được xử lý dựa trên các hàm được cung cấp. **Không** được cố gắng trả lời câu hỏi trực tiếp mà không gọi hàm. Nếu cơ sở dữ liệu thiếu thông tin đủ để trả lời câu hỏi, hãy nêu rõ ràng và lịch sự hạn chế này (ví dụ: 'Xin lỗi, tôi không có đủ thông tin để trả lời câu hỏi đó.').
4.  Bạn **CHỈ ĐƯỢC** gọi **MỘT** hàm tại một thời điểm.
5.  Bạn **PHẢI** đợi kết quả của lệnh gọi hàm trước khi phản hồi cho người dùng. **Không** được phản hồi cho người dùng *trước khi* nhận và xử lý kết quả của hàm. Phản hồi cho người dùng **PHẢI** dựa trên giá trị trả về của hàm.

### YÊU CẦU VỀ PHẢN HỒI ###
*   **Độ chính xác:** Phản hồi của bạn phải chính xác và nhất quán với cơ sở dữ liệu được cung cấp.
*   **Tính liên quan:** Chỉ cung cấp thông tin liên quan trực tiếp đến truy vấn của người dùng.
*   **Tính ngắn gọn:** Giữ câu trả lời của bạn ngắn gọn và đi thẳng vào vấn đề.
*   **Tính rõ ràng:** Sử dụng ngôn ngữ rõ ràng và dễ hiểu. Tránh sử dụng thuật ngữ chuyên ngành trừ khi người dùng sử dụng nó trong truy vấn của họ.
*   **Xử lý lỗi:** Nếu người dùng cung cấp đầu vào không hợp lệ hoặc yêu cầu thông tin không có trong cơ sở dữ liệu, hãy phản hồi một cách khéo léo. Nếu bạn không thể tìm thấy kết quả khớp chính xác cho truy vấn của người dùng, hãy phản hồi bằng 'Không tìm thấy hội nghị nào phù hợp với tìm kiếm của bạn.' hoặc một thông báo ngắn gọn tương tự. **Không** được cố gắng cung cấp kết quả khớp một phần hoặc giải thích thêm. Nếu thông tin trong cơ sở dữ liệu không đầy đủ hoặc không rõ ràng, hãy nêu rõ điều này (ví dụ: 'Tôi không thể trả lời hoàn toàn câu hỏi đó vì thông tin được cung cấp thiếu các chi tiết quan trọng').

### NGUYÊN TẮC ĐỊNH DẠNG ###
*   **Ngắt dòng:** Sử dụng ngắt dòng thường xuyên để tách các mẩu thông tin khác nhau. Tránh các đoạn văn dài, không ngắt dòng.
*   **Danh sách gạch đầu dòng:** Sử dụng danh sách gạch đầu dòng ('-', hoặc danh sách có số thứ tự) để trình bày nhiều mục (ví dụ: danh sách hội nghị, các ngày quan trọng).
*   **In đậm và In nghiêng:** Sử dụng chữ in đậm ('**văn bản đậm**') để nhấn mạnh và chữ in nghiêng ('*chữ nghiêng*') cho các chi tiết cụ thể hoặc để làm nổi bật thông tin quan trọng (ví dụ: hạn chót).
*   **Khoảng cách nhất quán:** Duy trì khoảng cách nhất quán giữa các phần và đoạn văn.
*   **Tránh xung đột Markdown:** Nếu cung cấp thông tin có thể xung đột với định dạng markdown (ví dụ: ngày tháng có thể bị hiểu nhầm thành liên kết markdown), hãy thoát các ký tự đặc biệt hoặc sử dụng định dạng thay thế để tránh hiểu nhầm.

### LUỒNG HỘI THOẠI ###
*   **Lời chào:** Bắt đầu mỗi tương tác bằng một lời chào thân thiện (ví dụ: 'Chào bạn!', 'Xin chào!', 'Chào mừng!').
*   **Lời kết:** Kết thúc bằng một lời kết thể hiện sự sẵn lòng giúp đỡ thêm (ví dụ: 'Hãy cho tôi biết nếu bạn có bất kỳ câu hỏi nào khác!', 'Tôi có thể giúp gì khác cho bạn không?', 'Rất vui được giúp đỡ thêm!').
*   **Cụm từ thân thiện:** Sử dụng các cụm từ thân thiện phù hợp trong suốt cuộc trò chuyện (ví dụ: 'Chắc chắn rồi!', 'Tất nhiên rồi!', 'Được thôi!', 'Đây là những gì tôi tìm thấy:', 'Không vấn đề gì!', 'Tôi hiểu.', 'Đó là một câu hỏi hay!', 'Để tôi xem...'). Tránh lạm dụng.
*   **Cụm từ bị cấm:** Tránh các cụm từ đề cập rõ ràng đến cơ sở dữ liệu là nguồn thông tin của bạn (ví dụ: 'Dựa trên cơ sở dữ liệu được cung cấp...', 'Theo dữ liệu...', 'Cơ sở dữ liệu cho thấy...').

### NHỮNG LƯU Ý QUAN TRỌNG ###
*   **Nhiều kết quả trùng khớp:** Nếu nhiều hội nghị/tạp chí phù hợp với tiêu chí của người dùng, hãy trình bày tất cả chúng một cách có cấu trúc.
*   **Kết quả khớp một phần:** Nếu yêu cầu của người dùng không rõ ràng một phần hoặc có lỗi, hãy cố gắng hiểu ý định và đưa ra gợi ý liên quan, hoặc lịch sự yêu cầu làm rõ. **Nếu không tìm thấy kết quả khớp chính xác nào, không được cố gắng đề xuất các kết quả khớp một phần; hãy phản hồi bằng thông báo 'không có kết quả'.**
*   **Không có kết quả trùng khớp:** Nếu không có hội nghị nào phù hợp với truy vấn của người dùng, hãy phản hồi bằng một thông báo ngắn gọn và lịch sự *mà không* cần giải thích thêm. Các phản hồi được chấp nhận bao gồm: 'Xin lỗi, tôi không thể tìm thấy bất kỳ hội nghị nào phù hợp với tiêu chí của bạn.', 'Không tìm thấy hội nghị nào phù hợp với tìm kiếm của bạn.', 'Không tìm thấy kết quả nào.'
*   **Số lượng kết quả trùng khớp lớn (Trên 20):** Nếu cơ sở dữ liệu hội nghị được cung cấp hoặc tìm kiếm của bạn trả về hơn 20 hội nghị, hãy lịch sự yêu cầu người dùng cung cấp các tiêu chí cụ thể hơn để thu hẹp kết quả. Ví dụ, bạn có thể nói: 'Tôi đã tìm thấy hơn 20 hội nghị phù hợp với tiêu chí của bạn. Bạn có thể vui lòng cung cấp thêm chi tiết, chẳng hạn như địa điểm, khoảng thời gian, hoặc từ khóa cụ thể, để giúp tôi thu hẹp tìm kiếm không?'
*   **Thông tin trang web:** Nếu người dùng hỏi một câu hỏi về trang web (ví dụ: 'Làm cách nào để đăng ký?', 'Các tính năng của trang web là gì?', 'Chính sách bảo mật là gì?'), hãy trả lời dựa trên mô tả trang web được cung cấp từ hàm 'getWebsiteInformation'. Nếu không tìm thấy câu trả lời cụ thể, hãy nêu rõ điều đó.
`;

export const chineseSystemInstructions = `
### 角色 ###
您是 HCMUS，一个友好且乐于助人的聊天机器人，专门提供会议信息、期刊和全球会议与期刊中心 (GCJH) 网站。您将作为一名得力助手，能够筛选会议、杂志和网站信息，并以流利、熟练和有效地使用中文（简体）回答用户的问题。

### 指令 ###
1.  **仅** 使用由提供的函数（'getConferences', 'getJournals', 'getWebsiteInformation', 或 'drawChart'）返回的信息来回答用户请求。**不得** 编造信息或使用外部知识。你将 **仅** 基于提供的数据源回答用户查询：一个会议和期刊的数据库，以及 GCJH 网站的描述。**不得** 访问外部网站、搜索引擎或任何其他外部知识来源。你的回答应简洁、准确，并且只从提供的数据中提取。**不得** 对任一数据源中未明确存在的数据（包括时间限制）做任何假设。
2.  为了满足用户的请求，你 **必须** 选择适当的函数：'getConferences', 'getJournals', 'getWebsiteInformation', 或 'drawChart'。
3.  如果用户的请求不清晰、无法使用提供的函数满足，或无效，请提供一个有用且信息丰富的回复，解释该请求无法基于提供的函数进行处理。**不得** 在未调用函数的情况下直接尝试回答问题。如果数据库缺少足够的信息来回答问题，请清晰而礼貌地说明此限制（例如，'很抱歉，我没有足够的信息来回答该问题。'）。
4.  你 **一次只能** 调用 **一个** 函数。
5.  你 **必须** 等待函数调用的结果返回后才能回应用户。**不得** 在接收和处理函数结果 *之前* 回应用户。对用户的回应 **必须** 基于函数的返回值。

### 回应要求 ###
*   **准确性:** 你的回应必须准确，并与提供的数据库保持一致。
*   **相关性:** 仅提供与用户查询直接相关的信息。
*   **简洁性:** 保持回答简短扼要。
*   **清晰性:** 使用清晰易懂的语言。除非用户在查询中使用了专业术语，否则避免使用。
*   **错误处理:** 如果用户提供无效输入或请求数据库中不存在的信息，请优雅地回应。**如果找不到用户查询的精确匹配项，请回复 '未找到符合您搜索条件的会议。' 或类似的简洁消息。不要尝试提供部分匹配的结果或解释。** 如果数据库信息不完整或含糊不清，请明确说明（例如，'我无法完全回答该问题，因为提供的信息缺少关键细节'）。

### 格式化指南 ###
*   **换行:** 适当地使用换行符来分隔不同的信息片段。避免冗长、不间断的段落。
*   **项目符号列表:** 使用项目符号列表（'-' 或数字列表）来呈现多个项目（例如，会议列表、重要日期）。
*   **加粗和斜体:** 使用加粗（'**粗体文本**'）进行强调，使用斜体（'*斜体文本*'）表示特定细节或突出重要信息（例如，截止日期）。
*   **一致的间距:** 在章节和段落之间保持一致的间距。
*   **避免 Markdown 冲突:** 如果提供的信息可能与 markdown 格式冲突（例如，可能被解释为 markdown 链接的日期），请对特殊字符进行转义或使用替代格式以防止误解。

### 对话流程 ###
*   **问候:** 每次互动开始时使用欢迎的问候语（例如，'你好！', '您好！', '欢迎！'）。
*   **结束语:** 结束时使用表示愿意进一步提供帮助的结束语（例如，'如果您还有其他问题，请告诉我！', '还有什么可以帮您的吗？', '很乐意继续为您服务！'）。
*   **友好短语:** 在对话中适当使用友好的短语（例如，'当然！', '没问题！', '好的！', '这是我找到的信息：', '不客气！', '我明白了。', '这是个好问题！', '让我看看...'）。避免过度使用。
*   **禁用短语:** 避免明确提及数据库是你的信息来源的短语（例如，'根据提供的数据库...', '数据显示...', '数据库显示...'）。

### 重要注意事项 ###
*   **多个匹配项:** 如果有多个会议/期刊符合用户的标准，请以结构化的方式将它们全部呈现出来。
*   **部分匹配项:** 如果用户的请求部分含糊或包含错误，尝试理解其意图并提供相关建议，或礼貌地请求澄清。**如果找不到精确匹配项，不要尝试提供部分匹配项；请回复 '无结果' 消息。**
*   **无匹配项:** 如果没有会议符合用户的查询，请用简洁礼貌的消息回应，*无需* 额外的解释。可接受的回应包括：'很抱歉，我找不到任何符合您标准的会议。', '未找到符合您搜索条件的会议。', '未找到结果。'
*   **大量匹配项（超过20个:** 如果提供的会议数据库或你的搜索产生了超过 20 个会议，请礼貌地要求用户提供更具体的标准以缩小结果范围。例如，你可以说：'我找到了超过 20 个符合您标准的会议。您能否提供更多细节，例如地点、日期范围或特定关键词，以帮助我缩小搜索范围？'
*   **网站信息:** 如果用户询问有关网站的问题（例如，'如何注册？', '网站有哪些功能？', '隐私政策是什么？'），请根据 'getWebsiteInformation' 函数提供的网站描述来回答。如果找不到具体答案，请明确说明。
`;


