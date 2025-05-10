// src/hooks/journals/useJournalResults.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { JournalResponse } from '../../models/response/journal.response'; // Đảm bảo đường dẫn đúng

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

interface UseJournalResultsProps {
  initialData?: JournalResponse[]; // Giữ lại để có thể truyền dữ liệu ban đầu nếu cần (SSR/SSG)
}

const useJournalResults = ({ initialData }: UseJournalResultsProps = {}) => {
    // State lưu trữ toàn bộ dữ liệu gốc từ API hoặc initialData
    const [baseJournals, setBaseJournals] = useState<JournalResponse[] | undefined>(initialData);
    // State lưu trữ dữ liệu đã được lọc và sắp xếp
    const [filteredJournals, setFilteredJournals] = useState<JournalResponse[] | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const journalsPerPage = 12;
    // Bỏ state sortBy vì nó sẽ được đọc từ searchParams
    // const [sortBy, setSortBy] = useState<JournalSortOption>('title');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Effect để fetch dữ liệu gốc từ API *chỉ một lần* khi component mount
    // hoặc khi initialData thay đổi (và không được cung cấp ban đầu)
    useEffect(() => {
        const fetchBaseData = async () => {
            // Chỉ fetch nếu không có initialData
            if (!initialData) {
                setLoading(true);
                setError(null);
                try {
                    console.log("Fetching base journal data from API...");
                    const response = await fetch('/api/journal'); // Gọi API endpoint
                    if (!response.ok) {
                        throw new Error(`API call failed with status: ${response.status}`);
                    }
                    const data: JournalResponse[] = await response.json();
                    console.log(`Received ${data.length} base journals from API.`);
                    setBaseJournals(data);
                    // Không set loading false ở đây, để fetchData xử lý
                } catch (error: any) {
                    console.error("Failed to fetch base journals:", error);
                    setError(error.message);
                    setBaseJournals([]); // Đặt là mảng rỗng khi có lỗi
                    setLoading(false); // Kết thúc loading nếu fetch lỗi
                }
            } else {
                 console.log("Using initialData provided.");
                 setBaseJournals(initialData); // Sử dụng initialData nếu được cung cấp
            }
        };

        fetchBaseData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]); // Chỉ chạy lại nếu initialData thay đổi

    // Callback để lọc và sắp xếp dữ liệu dựa trên searchParams
    const processData = useCallback(() => {
        // Chỉ xử lý khi baseJournals đã được load
        if (baseJournals === undefined) {
             console.log("Base journals not loaded yet, skipping processing.");
             // Có thể vẫn đặt loading=true nếu baseJournals đang được fetch
             setLoading(baseJournals === undefined && !initialData);
             return;
        }

        setLoading(true);
        setError(null);
        console.log("Processing data based on search params...");

        try {
            // Tạo object params từ searchParams.
            const params = {
                keyword: searchParams.get('keyword') || undefined,
                country: searchParams.get('country') || undefined,
                publicationType: searchParams.get('publicationType') || undefined,
                subjectAreas: searchParams.getAll('subjectAreas') || undefined,
                quartile: searchParams.get('quartile') || undefined,
                openAccessTypes: searchParams.getAll('openAccessTypes') || undefined, // Vẫn giữ lại logic dù chưa dùng
                publisher: searchParams.get('publisher') || undefined,
                language: searchParams.get('language') || undefined, // Vẫn giữ lại logic dù chưa dùng
                impactFactor: searchParams.get('impactFactor') || undefined,
                hIndex: searchParams.get('hIndex') || undefined,
                citeScore: searchParams.get('citeScore') || undefined, // Vẫn giữ lại logic dù chưa dùng
                sjr: searchParams.get('sjr') || undefined,
                overallRank: searchParams.get('overallRank') || undefined, // Vẫn giữ lại logic dù chưa dùng
                issn: searchParams.get('issn') || undefined,
                sortBy: (searchParams.get('sortBy') as JournalSortOption) || 'title',
            };

            // Bắt đầu với toàn bộ dữ liệu gốc
            let journalsToProcess = [...baseJournals];
             console.log("Initial journals count for processing:", journalsToProcess.length);

            // --- Áp dụng bộ lọc --- (Logic lọc giữ nguyên như cũ)
            if (params.keyword && params.keyword.length > 0) {
                journalsToProcess = journalsToProcess.filter(journal =>
                    journal.Title.toLowerCase().includes(params.keyword?.toLowerCase() || '')
                );
            }
            if (params.country) {
                journalsToProcess = journalsToProcess.filter(journal => journal.Country === params.country);
            }
            if (params.publicationType) {
                journalsToProcess = journalsToProcess.filter(journal => journal.Type === params.publicationType);
            }
            if (params.subjectAreas && params.subjectAreas.length > 0) {
                 journalsToProcess = journalsToProcess.filter(journal =>
                    params.subjectAreas && // Đảm bảo params.subjectAreas không phải undefined
                    journal["Subject Area and Category"]?.Topics?.some(topic => params.subjectAreas?.includes(topic))
                );
            }
            if (params.quartile) {
                journalsToProcess = journalsToProcess.filter(journal =>
                    journal.SupplementaryTable?.some(item => item.Quartile === params.quartile)
                );
            }
            // Bỏ qua lọc OpenAccessTypes và Language nếu không có dữ liệu
            // if (params.openAccessTypes && params.openAccessTypes.length > 0) { ... }
            if (params.publisher) {
                journalsToProcess = journalsToProcess.filter(journal => journal.Publisher === params.publisher);
            }
            // if (params.language) { ... }
            if (params.issn && params.issn.length > 0) {
                journalsToProcess = journalsToProcess.filter(journal => (journal.ISSN || '').includes(params.issn || ''));
            }

            // Bộ lọc chỉ số - Logic giữ nguyên
            const filterMetric = (metricValue: string | undefined | null, selectedValue: string | null | undefined): boolean => {
                 if (!selectedValue || metricValue === undefined || metricValue === null) return true; // Cho phép nếu không có bộ lọc hoặc giá trị journal không tồn tại
                 try {
                    // Xử lý trường hợp metricValue có thể là null hoặc không phải string
                    const metricString = String(metricValue);
                    const selectedNum = parseFloat(selectedValue.replace(/[^0-9.-]/g, ''));
                    const journalNum = parseFloat(metricString.replace(/[^0-9.-]/g, ''));

                    if (isNaN(journalNum)) return true; // Nếu giá trị journal không phải số, bỏ qua bộ lọc này

                    if (selectedValue.startsWith(">=")) return journalNum >= selectedNum;
                    if (selectedValue.startsWith(">")) return journalNum > selectedNum;
                    if (selectedValue.startsWith("<=")) return journalNum <= selectedNum;
                    if (selectedValue.startsWith("<")) return journalNum < selectedNum;
                    if (selectedValue.includes("-")) {
                        const parts = selectedValue.split("-");
                        if (parts.length === 2) {
                            const min = parseFloat(parts[0]);
                            const max = parseFloat(parts[1]);
                             if (!isNaN(min) && !isNaN(max)) {
                                return journalNum >= min && journalNum <= max;
                            }
                        }
                    }
                    // Nếu không có toán tử hoặc khoảng, so sánh bằng nhau
                    if(!selectedValue.match(/^[<>]=?/)) {
                        return journalNum === selectedNum;
                    }

                    return true; // Mặc định trả về true nếu không khớp định dạng nào
                } catch (error) {
                    console.error("Lỗi khi phân tích giá trị chỉ số:", metricValue, selectedValue, error);
                    return true; // Bỏ qua bộ lọc nếu có lỗi parse
                }
            };

            if (params.impactFactor) {
                journalsToProcess = journalsToProcess.filter(journal => filterMetric(journal.bioxbio?.[0]?.Impact_factor, params.impactFactor));
            }
            if (params.hIndex) {
                journalsToProcess = journalsToProcess.filter(journal => filterMetric(journal["H index"], params.hIndex));
            }
             // Bỏ qua lọc CiteScore và OverallRank nếu không có dữ liệu
            // if (params.citeScore) { ... }
            if (params.sjr) {
                journalsToProcess = journalsToProcess.filter(journal => filterMetric(journal.SJR, params.sjr));
            }
            // if (params.overallRank) { ... }
            // --- Kết thúc bộ lọc ---

            console.log("Journals count after filtering:", journalsToProcess.length);

            // --- Áp dụng sắp xếp --- (Logic sắp xếp giữ nguyên)
            let sortedJournals = [...journalsToProcess]; // Tạo bản sao để sắp xếp
            const sortBy = params.sortBy;

            // Hàm trợ giúp để parse số an toàn cho sắp xếp
             const safeParseFloat = (value: string | undefined | null): number => {
                 if (value === undefined || value === null) return 0;
                 // Loại bỏ ký tự không phải số hoặc dấu chấm/trừ trước khi parse
                 const cleanedValue = String(value).replace(/[^0-9.-]/g, '');
                 const number = parseFloat(cleanedValue);
                 return isNaN(number) ? 0 : number; // Trả về 0 nếu không phải số hợp lệ
             };


            switch (sortBy) {
                case 'title':
                    sortedJournals.sort((a, b) => a.Title.localeCompare(b.Title));
                    break;
                case 'issn':
                    sortedJournals.sort((a, b) => (a.ISSN || '').localeCompare(b.ISSN || ''));
                    break;
                case 'publisher':
                    sortedJournals.sort((a, b) => (a.Publisher || '').localeCompare(b.Publisher || ''));
                    break;
                // case 'language': break; // Bỏ qua sắp xếp theo Language
                case 'impactFactor':
                    sortedJournals.sort((a, b) => {
                        const impactFactorA = safeParseFloat(a.bioxbio?.[0]?.Impact_factor);
                        const impactFactorB = safeParseFloat(b.bioxbio?.[0]?.Impact_factor);
                        return impactFactorB - impactFactorA; // Giảm dần
                    });
                    break;
                // case 'citeScore': break; // Bỏ qua sắp xếp theo CiteScore
                case 'sjr':
                    sortedJournals.sort((a, b) => {
                        const sjrA = safeParseFloat(a.SJR);
                        const sjrB = safeParseFloat(b.SJR);
                        return sjrB - sjrA; // Giảm dần
                    });
                    break;
                // case 'overallRank': break; // Bỏ qua sắp xếp theo OverallRank
                case 'hIndex':
                    sortedJournals.sort((a, b) => {
                        const hIndexA = safeParseFloat(a["H index"]);
                        const hIndexB = safeParseFloat(b["H index"]);
                        return hIndexB - hIndexA; // Giảm dần
                    });
                    break;
                default:
                    sortedJournals.sort((a, b) => a.Title.localeCompare(b.Title));
                    break;
            }
            // --- Kết thúc sắp xếp ---

            console.log(`Setting ${sortedJournals.length} filtered and sorted journals.`);
            setFilteredJournals(sortedJournals);
            // Reset về trang 1 mỗi khi lọc/sắp xếp thay đổi (quan trọng!)
            // Tuy nhiên, việc này có thể gây tranh cãi về UX. Nếu muốn giữ trang hiện tại, cần logic phức tạp hơn.
            // Tạm thời reset về trang 1 cho đơn giản.
            setCurrentPage(1);

        } catch (error: any) {
            console.error("Failed to process journal data:", error);
            setError(error.message);
            setFilteredJournals([]); // Đặt mảng rỗng khi có lỗi xử lý
        } finally {
            setLoading(false); // Hoàn tất xử lý (dù thành công hay lỗi)
            console.log("Data processing finished.");
        }
    }, [baseJournals, searchParams]); // Phụ thuộc vào dữ liệu gốc và params tìm kiếm

    // Effect để chạy processData khi dữ liệu gốc hoặc searchParams thay đổi
    useEffect(() => {
        processData();
    }, [processData]); // processData đã bao gồm dependencies của nó

    // Tính toán dữ liệu cho trang hiện tại từ filteredJournals
    const indexOfLastJournal = currentPage * journalsPerPage;
    const indexOfFirstJournal = indexOfLastJournal - journalsPerPage;
    // Luôn trả về mảng rỗng nếu filteredJournals chưa sẵn sàng hoặc rỗng
    const currentJournals = filteredJournals?.slice(indexOfFirstJournal, indexOfLastJournal) ?? [];

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= Math.ceil((filteredJournals?.length ?? 0) / journalsPerPage)) {
             setCurrentPage(pageNumber);
        }
    }

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = event.target.value as JournalSortOption;
        const current = new URLSearchParams(Array.from(searchParams.entries())); // Clone searchParams
        current.set('sortBy', newSortBy);
        // Không cần lấy localePrefix vì router.push với path tương đối sẽ giữ nguyên locale
        router.push(`${pathname}?${current.toString()}`); // Sử dụng pathname hiện tại
    };

    // Lấy giá trị sortBy hiện tại từ searchParams để hiển thị trên UI
    const currentSortBy = (searchParams.get('sortBy') as JournalSortOption) || 'title';

    return {
        journals: filteredJournals, // Trả về danh sách đã lọc/sắp xếp
        totalJournals: filteredJournals?.length ?? 0, // Tổng số sau khi lọc
        currentPage,
        journalsPerPage,
        sortBy: currentSortBy, // Giá trị sortBy hiện tại từ URL
        loading,
        error,
        currentJournals, // Danh sách cho trang hiện tại
        paginate,
        handleSortByChange,
    };
};

export default useJournalResults;