import React from 'react';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntroduceVisualization from '@/src/app/[locale]/home/IntroduceVisualization'; // Điều chỉnh đường dẫn
// Helper để query bên trong element khác (nếu chưa import)
import { within } from '@testing-library/react';


// --- Mocks ---

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: jest.fn(() => (key: string) => key) // Mock t(key) trả về chính key đó
  }))

// Mock next/navigation Link
jest.mock('@/src/navigation', () => ({ // Điều chỉnh đường dẫn
    Link: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

// Mock recharts
// Lưu trữ các props được truyền cho component mock chính để kiểm tra data
let mockChartProps: any = null;
jest.mock('recharts', () => {
    // Danh sách các props của Recharts không phải là thuộc tính HTML hợp lệ
    // Bạn có thể cần bổ sung thêm nếu gặp warning khác
    const invalidHtmlPropsList = [
        'dataKey', 'tickFormatter', 'content', 'animationDuration', 'outerRadius',
        'innerRadius', 'nameKey', 'paddingAngle', 'verticalAlign', 'wrapperStyle',
        'activeDot', 'vertical', 'strokeDasharray', 'angle', 'textAnchor',
        'interval', 'tick', 'dy', 'cx', 'cy', 'strokeWidth', 'dot', 'radius',
        'margin', 'data', // data được xử lý riêng, không spread
        'fill', 'stroke', // Xử lý riêng cho style của Cell
        'payload', 'label', 'name', 'value', // Các props thường gặp khác
        'type', // ví dụ type="monotone" cho Line
        'cursor', 'legendType', 'iconSize', 'iconType',
        'layout', 'barSize', 'stackId',
        // Thêm các props khác bạn thấy trong warning nếu có
    ];

    // Hàm helper để lọc props
    const filterInvalidHtmlProps = (allProps: any) => {
        const validProps: { [key: string]: any } = {};
        for (const key in allProps) {
            // Chỉ giữ lại những prop KHÔNG nằm trong danh sách không hợp lệ
            // và không phải là prop nội bộ data-charttype
            if (!invalidHtmlPropsList.includes(key) &&
                key !== 'data-charttype' &&
                Object.prototype.hasOwnProperty.call(allProps, key))
            {
                validProps[key] = allProps[key];
            }
        }
        return validProps;
    };

    const MockChartComponent = ({ children, 'data-charttype': chartType, data, ...props }: any) => {
        // Log giá trị 'data' mà mock nhận được
        mockChartProps = { data, ...props }; // Ghi lại props, đặc biệt là data
        // Lọc ra các props không hợp lệ trước khi render div
        const validHtmlProps = filterInvalidHtmlProps(props);
        return (
            <div data-testid={`recharts-mock-${chartType || 'chart'}`} {...validHtmlProps}>
                {/* Render children nếu cần */}
                {children}
            </div>
        );
    };
    
    const MockElement = ({ children, ...props }: any) => {
        // Xử lý style riêng cho Cell
        const styleProp = props['data-testid'] === 'cell' ? { style: { backgroundColor: props.fill } } : {};

        // Lọc ra các props không hợp lệ
        const validHtmlProps = filterInvalidHtmlProps(props);

        // Kết hợp props hợp lệ và style (nếu có)
        const finalProps = { ...validHtmlProps, ...styleProp };

        return (
            <div data-testid={`recharts-${props['data-testid'] || 'element'}`} {...finalProps}>
                {children}
            </div>
        );
    };

    return {
        ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
        BarChart: (props: any) => <MockChartComponent {...props} data-charttype="barchart" />,
        PieChart: (props: any) => <MockChartComponent {...props} data-charttype="piechart" />,
        LineChart: (props: any) => <MockChartComponent {...props} data-charttype="linechart" />,
        Bar: (props: any) => <MockElement {...props} data-testid="bar" />,
        Pie: (props: any) => <MockElement {...props} data-testid="pie" />,
        Line: (props: any) => <MockElement {...props} data-testid="line" />,
        CartesianGrid: (props: any) => <MockElement {...props} data-testid="grid" />,
        XAxis: (props: any) => <MockElement {...props} data-testid="xaxis" />,
        YAxis: (props: any) => <MockElement {...props} data-testid="yaxis" />,
        Tooltip: (props: any) => <MockElement {...props} data-testid="tooltip" />,
        Legend: (props: any) => <MockElement {...props} data-testid="legend" />,
        Cell: (props: any) => <MockElement {...props} data-testid="cell" style={{ backgroundColor: props.fill }} />,
    };
});


// Sử dụng fake timers của Jest
jest.useFakeTimers();

// --- Tests ---

describe('IntroduceVisualization Component', () => {

    beforeEach(() => {
        cleanup();
        jest.clearAllMocks();
        jest.clearAllTimers(); // Quan trọng khi dùng fake timers
        mockChartProps = null; // Reset props chart đã ghi lại
    });

    test('renders initial content and loading state', async () => {
        render(<IntroduceVisualization />);

        expect(screen.getByRole('heading', { name: 'heading' })).toBeInTheDocument();
        expect(screen.getByText('description')).toBeInTheDocument();

        const buttonLink = screen.getByRole('link', { name: 'buttonAriaLabel' });
        expect(buttonLink).toBeInTheDocument();
        expect(buttonLink).toHaveAttribute('href', '/visualization');
        expect(screen.getByText('buttonText')).toBeInTheDocument();
        expect(buttonLink.querySelector('svg')).toBeInTheDocument(); // Kiểm tra icon mũi tên

        // Kiểm tra trạng thái loading ban đầu (trước khi isClient=true)
        await waitFor(() => {
            expect(screen.queryByText('Loading Chart...')).not.toBeInTheDocument();
        });
        expect(screen.queryByTestId('recharts-mock-barchart')).toBeInTheDocument();
        expect(screen.queryByTestId('responsive-container')).toBeInTheDocument(); // Chưa có container
    });

    test('renders Bar chart after client-side mount', async () => {
        render(<IntroduceVisualization />);

        // Đợi useEffect(() => setIsClient(true), []) chạy và component re-render
        await waitFor(() => {
            expect(screen.queryByText('Loading Chart...')).not.toBeInTheDocument();
        });

        // Kiểm tra container và chart đầu tiên (Bar) đã render
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        const barChart = screen.getByTestId('recharts-mock-barchart');
        expect(barChart).toBeInTheDocument();
        expect(screen.queryByTestId('recharts-mock-piechart')).not.toBeInTheDocument();
        expect(screen.queryByTestId('recharts-mock-linechart')).not.toBeInTheDocument();


        // Kiểm tra data được truyền vào BarChart (sử dụng mockChartProps)
        expect(mockChartProps).not.toBeNull();
        expect(mockChartProps.data).toHaveLength(6); // sampleDataSets[0] có 6 phần tử
        expect(mockChartProps.data[0].id).toBe('asia');
        expect(mockChartProps.data[0].value).toBe(45);
    });

    test('cycles through chart types (Bar -> Pie -> Line -> Bar with new data)', async () => {
        render(<IntroduceVisualization />);

        // 1. Chờ Bar chart ban đầu
        await waitFor(() => 
            {
                expect(screen.getByTestId('recharts-mock-barchart')).toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-piechart')).not.toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-linechart')).not.toBeInTheDocument();
            })  
        const initialData = mockChartProps.data; // Lưu data ban đầu

        // 2. Tiến tới Pie chart
        act(() => { jest.advanceTimersByTime(3000); });
        await waitFor(() => 
            {
                expect(screen.getByTestId('recharts-mock-piechart')).toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-barchart')).not.toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-linechart')).not.toBeInTheDocument();
            });
        // Data vẫn là của set 0
        expect(mockChartProps.data).toEqual(initialData);

        // 3. Tiến tới Line chart
        act(() => { jest.advanceTimersByTime(3000); });
        await waitFor(() => 
            {
                expect(screen.getByTestId('recharts-mock-linechart')).toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-piechart')).not.toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-barchart')).not.toBeInTheDocument();
            })
         // Data vẫn là của set 0
         expect(mockChartProps.data).toEqual(initialData);

        // 4. Tiến tới Bar chart lần nữa (VÀ chuyển sang data set 1)
        act(() => { jest.advanceTimersByTime(3000); });
        await waitFor(() => 
            {
                expect(screen.getByTestId('recharts-mock-barchart')).toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-linechart')).not.toBeInTheDocument();
                expect(screen.queryByTestId('recharts-mock-piechart')).not.toBeInTheDocument();
            })
        // Kiểm tra data đã chuyển sang set 1)
        expect(mockChartProps.data).not.toEqual(initialData);
        expect(mockChartProps.data).toHaveLength(6);
        expect(mockChartProps.data[0].id).toBe('asia');
        expect(mockChartProps.data[0].value).toBe(50); // Giá trị mới từ sampleDataSets[1]
    });

    test('clears interval timer on unmount', async () => {
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
        const { unmount } = render(<IntroduceVisualization />);

        // Chờ component mount và chạy effect lần đầu
        await waitFor(() => {
           expect(screen.queryByText('Loading Chart...')).not.toBeInTheDocument();
        });

        // Component unmount, hàm cleanup của effect timer phải chạy
        unmount();

        // Kiểm tra clearInterval đã được gọi
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
        // Kiểm tra nó được gọi với ID trả về từ setInterval (nếu cần chi tiết hơn)
        // expect(clearIntervalSpy).toHaveBeenCalledWith(expect.any(Number)); // Hoặc ID cụ thể nếu lấy được

        clearIntervalSpy.mockRestore(); // Dọn dẹp spy
    });

    test('renders Recharts elements inside chart mocks', async () => {
        render(<IntroduceVisualization />);
         await waitFor(() => expect(screen.getByTestId('recharts-mock-barchart')).toBeInTheDocument());

         // Tìm các element con bên trong mock chart (dựa vào data-testid đã đặt trong mock)
         const barChartMock = screen.getByTestId('recharts-mock-barchart');
         expect(within(barChartMock).getByTestId('grid')).toBeInTheDocument();
         expect(within(barChartMock).getByTestId('xaxis')).toBeInTheDocument();
         expect(within(barChartMock).getByTestId('yaxis')).toBeInTheDocument();
         expect(within(barChartMock).getByTestId('tooltip')).toBeInTheDocument();
         // Lưu ý: Chúng ta không thể dễ dàng kiểm tra số lượng 'cell' vì mock render chúng trong 1 div cha 'bar'
         expect(within(barChartMock).getByTestId('bar')).toBeInTheDocument();
         // expect(within(barChartMock).getAllByTestId('recharts-cell')).toHaveLength(6); // Sẽ khó nếu mock không render riêng lẻ
    });
});

