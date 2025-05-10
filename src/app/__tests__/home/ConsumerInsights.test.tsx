import React from 'react';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsumerInsights from '@/src/app/[locale]/home/ConsumerInsights'; // Điều chỉnh đường dẫn

// --- Mocks ---

// 1. Mock next-intl
// Trả về key thay vì bản dịch thực tế để test dễ dàng hơn
jest.mock('next-intl', () => ({
    useTranslations: jest.fn(() => (key: string) => key) // Mock t(key) trả về chính key đó
  }))
  
// 2. Mock custom navigation (Link và usePathname)
// Chúng ta cần một biến để có thể thay đổi giá trị trả về của usePathname trong các test khác nhau
let mockPathname = '/' // Default to homepage for the first test scenario
jest.mock('@/src/navigation', () => ({
// Mock Link component để render thành thẻ <a> đơn giản
// Xử lý cả href là string và object
Link: jest.fn(({ href, children, ...props }) => (
    <a href={typeof href === 'string' ? href : JSON.stringify(href)} {...props}>
    {children}
    </a>
)),
// Mock usePathname để trả về giá trị chúng ta kiểm soát
usePathname: jest.fn(() => mockPathname)
}))


// Mock next/image
// Mock này cần trả về một component có thể nhận các props như fill, style
const mockImageProps = jest.fn(); // Giữ lại để theo dõi props
jest.mock('next/image', () => {
    // Định nghĩa trực tiếp Function Component làm mock
    const MockNextImageComponent = (props: any) => {
        mockImageProps(props); // Gọi hàm theo dõi props
        const { src, alt, style, fill, width, height, priority, className, ...rest } = props;
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} style={style} data-fill={fill?.toString()} {...rest} />; // Render img cơ bản và lưu fill vào data-*
    };
    // Trả về object module với component mock là default export
    return {
        __esModule: true,
        default: MockNextImageComponent, // Export trực tiếp component
    };
});


// Mock ../utils/Button
jest.mock('../../[locale]/utils/Button', () => { // <-- Factory function không nhận props
    // Trả về một Function Component thực tế sẽ được dùng làm mock
    // Function Component này *sẽ* nhận props khi được render
    const MockButtonComponent = jest.fn((props) => {
      // Destructure props *bên trong* component mock
      const {
        children,
        variant = 'primary',
        size = 'medium',
        rounded = false,
        advanced = false,
        className,
        advancedDivColor = '',
        ...htmlButtonProps
      } = props; // <-- props bây giờ đã được định nghĩa
  
      // Logic tạo button và xử lý advanced giữ nguyên như trước
      const buttonElement = (
        <button
          className={className}
          {...htmlButtonProps}
          data-testid="mock-button"
        >
          {children}
        </button>
      );
  
      if (advanced) {
        return (
          <div
            className={advancedDivColor}
            data-testid="mock-button-wrapper"
          >
            {buttonElement}
          </div>
        );
      } else {
        return buttonElement;
      }
    });
  
    
  
    // Trả về component mock đã định nghĩa
    return jest.fn(MockButtonComponent);
  });

const MockButton = require('../../[locale]/utils/Button');



// 5. Mock next/dynamic - Sửa lỗi chính
jest.mock('next/dynamic', () => ({
    __esModule: true, // Nên thêm cho ES Modules
    // Mock hàm dynamic() default export
    default: jest.fn().mockImplementation((loaderPromise, options) => {
        // Chúng ta không thực sự chạy loaderPromise trong mock đơn giản này.
        // Chúng ta chỉ cần trả về component sẽ thay thế cho component được load động.
        const MockOdometerComponent = ({ value, format }: { value: number; format?: string }) => {
            const formatNumber = (num: number): string => {
                if (format === '(,ddd)') { return num.toLocaleString('en-US'); }
                return num?.toString() ?? ''; // Sử dụng ?? để xử lý null/undefined
            };
            // Sử dụng data-testid để query trong test
            return <span data-testid="odometer-mock">{formatNumber(value)}</span>;
        };
        MockOdometerComponent.displayName = 'MockOdometer';

        // Nếu có options.loading, bạn có thể xử lý nó ở đây nếu cần test trạng thái loading
        // if (options?.loading) {
        //   return options.loading(); // Render component loading
        // }

        // Trả về component mock thực tế
        return MockOdometerComponent;
    })
}));
// Không cần require ở đây nữa
// const MockOdometer = require('next/dynamic').default;
// Để kiểm tra Odometer được gọi, hãy query element span[data-testid="odometer-mock"]


// Mock IntersectionObserver global
let intersectionCallback: IntersectionObserverCallback | null = null;
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

// Giả sử @types/node đã được cài đặt hoặc bạn dùng cách thay thế
global.IntersectionObserver = jest.fn().mockImplementation((callback, options) => {
  intersectionCallback = callback;
  return {
    root: null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0],
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    takeRecords: jest.fn(() => []),
  };
});

// Hàm helper trigger intersection
const triggerIntersection = (targetElement: Element | null, isIntersecting = true) => {
  if (intersectionCallback && targetElement) {
    const entry: IntersectionObserverEntry = {
      isIntersecting: isIntersecting, target: targetElement, intersectionRatio: isIntersecting ? 1 : 0, time: Date.now(),
      boundingClientRect: targetElement.getBoundingClientRect(),
      intersectionRect: isIntersecting ? targetElement.getBoundingClientRect() : ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRectReadOnly),
      rootBounds: document.body.getBoundingClientRect(),
    };
    act(() => { // Wrap callback invocation in act
       intersectionCallback!([entry], global.IntersectionObserver as unknown as IntersectionObserver);
    });
  } else { console.warn('IntersectionObserver callback not captured or targetElement missing.'); }
};


// --- Tests ---

describe('ConsumerInsights Component', () => {
    const expectedStats = [
        { value: 15000, label: 'stats.0' },
        { value: 8000, label: 'stats.1' },
        { value: 120, label: 'stats.2' },
        { value: 75, label: 'stats.3' },
    ];

    beforeEach(() => {
        cleanup();  
        jest.clearAllMocks();
        intersectionCallback = null;
    });

    test('renders initial content correctly before intersection', () => {
        render(<ConsumerInsights />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'subtitle' })).toBeInTheDocument();
        expect(screen.getByText('description')).toBeInTheDocument();

        const image = screen.getByAltText('Background showing network or abstract data visualization');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/bg-2.jpg');
        expect(mockImageProps).toHaveBeenCalledTimes(1);
        expect(mockImageProps.mock.calls[0][0]).toEqual(
            expect.objectContaining({ src: '/bg-2.jpg', alt: 'Background showing network or abstract data visualization', width: 600, height: 450 })
        );
        // Kiểm tra priority không có trong component code mới -> không nên có trong props
        // expect(mockImageProps.mock.calls[0][0].priority).toBeUndefined();


        const buttonLink = screen.getByRole('link', { name: 'buttonText' });
        expect(buttonLink).toBeInTheDocument();
        expect(buttonLink).toHaveAttribute('href', '/conferences');
        expect(screen.getByRole('button', { name: 'buttonText' })).toBeInTheDocument();
        expect(MockButton).toHaveBeenCalledTimes(1);

        expectedStats.forEach(stat => {
            expect(screen.getByText(stat.label)).toBeInTheDocument();
        });

        const odometerMocks = screen.getAllByTestId('odometer-mock');
        expect(odometerMocks).toHaveLength(expectedStats.length);
        odometerMocks.forEach(odometer => {
            // Giá trị ban đầu là 0 do isVisible=false
            expect(odometer).toHaveTextContent('0');
        });
        

        expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);
        expect(mockObserve).toHaveBeenCalledTimes(1);
        expect(mockUnobserve).not.toHaveBeenCalled();
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    test('updates Odometer values when component becomes visible', async () => {
        const { container } = render(<ConsumerInsights />);
        const componentElement = container.firstChild as Element;

        screen.getAllByTestId('odometer-mock').forEach(odometer => {
             expect(odometer).toHaveTextContent('0');
        });

        triggerIntersection(componentElement, true); // act() is inside helper

        await waitFor(() => {
             expect(screen.getByText('15,000')).toBeInTheDocument();
             expect(screen.getByText('8,000')).toBeInTheDocument();
             expect(screen.getByText('120')).toBeInTheDocument();
             expect(screen.getByText('75')).toBeInTheDocument();
        });

        expect(mockUnobserve).toHaveBeenCalledTimes(1);
        expect(mockUnobserve).toHaveBeenCalledWith(componentElement);
    });

    test('does not update Odometer values if component does not intersect', async () => {
        const { container } = render(<ConsumerInsights />);
        const componentElement = container.firstChild as Element;

        triggerIntersection(componentElement, false); // act() is inside helper

        // Chờ một chút để đảm bảo không có cập nhật không mong muốn
        await waitFor(() => expect(screen.getAllByTestId('odometer-mock')[0]).toBeInTheDocument(), { timeout: 50 });

        screen.getAllByTestId('odometer-mock').forEach(odometer => {
            expect(odometer).toHaveTextContent('0');
        });
        expect(mockUnobserve).not.toHaveBeenCalled();
    });


    test('calls IntersectionObserver cleanup on unmount', () => {
        const { unmount, container } = render(<ConsumerInsights />);
        const componentElement = container.firstChild as Element;

        expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);
        expect(mockObserve).toHaveBeenCalledTimes(1);
        expect(mockObserve).toHaveBeenCalledWith(componentElement);

        // Component logic: unobserve được gọi khi intersect
        triggerIntersection(componentElement, true);
        expect(mockUnobserve).toHaveBeenCalledTimes(1); // Called once on intersect

        // Component unmounts, cleanup function chạy
        unmount();

        // Cleanup gọi disconnect, và có thể gọi unobserve lần nữa (tuỳ logic cleanup)
        // Trong code hiện tại, unobserve chỉ gọi 1 lần khi intersect
        // expect(mockUnobserve).toHaveBeenCalledTimes(2); // HOẶC 1 tùy logic
        expect(mockUnobserve).toHaveBeenCalledWith(componentElement); // Phải unobserve đúng element
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
});