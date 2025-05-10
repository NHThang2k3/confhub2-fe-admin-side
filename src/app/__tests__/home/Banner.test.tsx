import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For assertions like .toBeInTheDocument()
import Banner from '@/src/app/[locale]/home/Banner'; // Adjust import path

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
const mockImageProps = jest.fn(); // Để theo dõi props được truyền
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

// Mock next-themes
let currentTheme = 'light';
const mockSetTheme = jest.fn((newTheme) => {
  currentTheme = newTheme;
});
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: mockSetTheme,
  }),
  // Provide a ThemeProvider mock if needed, often hook is enough
  ThemeProvider: jest.fn(({ children }) => <>{children}</>),
}));

// Helper to control theme for tests
const __setMockTheme = jest.fn((theme) => {
  currentTheme = theme;
});

// Mock Button component
// Mock trong Banner.test.js (từ câu trả lời trước)
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

// --- Tests ---

describe('Banner Component', () => {
  beforeEach(() => {
    // Reset theme and mocks before each test
    __setMockTheme('light');
    mockSetTheme.mockClear();
    mockImageProps.mockClear()
    MockButton.mockClear(); // Quan trọng: Xóa lịch sử gọi của mock Button
  });

  test('renders correctly with light theme', () => {
    render(<Banner />);

    // Check for text content (using mocked translations - keys are returned)
    expect(screen.getByRole('heading', { name: 'Slogan_Website' })).toBeInTheDocument();
    expect(screen.getByText('Slogan_Website_describe')).toBeInTheDocument();

    // Check for buttons and links
    const conferenceButtonLink = screen.getByRole('link', { name: 'Search_Conferences' });
    expect(conferenceButtonLink).toBeInTheDocument();
    expect(conferenceButtonLink).toHaveAttribute('href', '/conferences');
    // Find button by text within the link
    expect(conferenceButtonLink.querySelector('[data-testid="mock-button"]')).toHaveTextContent('Search_Conferences');


    const journalButtonLink = screen.getByRole('link', { name: 'Search_Journals' });
    expect(journalButtonLink).toBeInTheDocument();
    expect(journalButtonLink).toHaveAttribute('href', '/journals');
    expect(journalButtonLink.querySelector('[data-testid="mock-button"]')).toHaveTextContent('Search_Journals');

    // Check for image (using alt text and mocked src)
    const bannerImage = screen.getByAltText('Banner Background');
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute('src', '/light.jpg'); // Light theme image
  });

  test('renders correctly with dark theme', () => {
    __setMockTheme('dark'); // Set theme to dark using the mock helper
    render(<Banner />);

    // Check text content
    expect(screen.getByRole('heading', { name: 'Slogan_Website' })).toBeInTheDocument();
    expect(screen.getByText('Slogan_Website_describe')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('link', { name: 'Search_Conferences' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search_Journals' })).toBeInTheDocument();

    // Check for image (should now be the dark theme image)
    const bannerImage = screen.getByAltText('Banner Background');
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute('src', '/2.png'); // Dark theme image
  });
  test('renders basic structure correctly', () => {
    const { container } = render(<Banner />);

    // Kiểm tra phần tử section gốc
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('relative', 'h-screen', 'w-full'); // Kiểm tra các lớp cơ bản

    // Kiểm tra heading và description
    expect(screen.getByRole('heading', { name: 'Slogan_Website', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Slogan_Website_describe')).toBeInTheDocument();

    // Kiểm tra container chứa nút bấm
    // Cách 1: Tìm thông qua text của nút bấm rồi tìm cha chung gần nhất (hơi phức tạp)
    // Cách 2: Thêm data-testid vào div chứa nút bấm trong component Banner (khuyến nghị)
    // Giả sử đã thêm data-testid="button-container" vào div chứa 2 nút
    // const buttonContainer = screen.getByTestId('button-container');
    // expect(buttonContainer).toBeInTheDocument();
    // expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row'); // Kiểm tra layout flex

    // Kiểm tra sự tồn tại của các link
    expect(screen.getByRole('link', { name: 'Search_Conferences' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search_Journals' })).toBeInTheDocument();
  });

  test('passes correct props to the Image component for light theme', () => {
  __setMockTheme('light'); // Đảm bảo theme đúng
  render(<Banner />);
  expect(mockImageProps).toHaveBeenCalledTimes(1);
  const imageProps = mockImageProps.mock.calls[0][0];
  expect(imageProps.src).toBe('/light.jpg');
  expect(imageProps.alt).toBe('Banner Background');
  expect(imageProps.fill).toBe(true);
  expect(imageProps.style).toEqual({
    objectFit: 'cover',
    objectPosition: 'center'
  });
});

test('passes correct props to the Image component for dark theme', () => {
  __setMockTheme('dark'); // Đặt theme dark
  render(<Banner />);

  expect(mockImageProps).toHaveBeenCalledTimes(1); // Mong đợi 1 lần gọi TRONG test case NÀY
  const imageProps = mockImageProps.mock.calls[0][0];
  expect(imageProps.src).toBe('/2.png');
   expect(imageProps.alt).toBe('Banner Background');
   expect(imageProps.fill).toBe(true);
   expect(imageProps.style).toEqual({
     objectFit: 'cover',
     objectPosition: 'center'
   });
});

  test('passes correct props to the "Search Conferences" Button', () => {
    render(<Banner />);

    // Tìm button "Search Conferences" thông qua text hoặc testid của mock
    // Vì mock Button được gọi 2 lần, chúng ta cần kiểm tra lần gọi cụ thể
    expect(MockButton).toHaveBeenCalledTimes(2);

    // Kiểm tra props của lần gọi đầu tiên (giả sử là Conferences Button)
    // Cách 1: Tìm theo children (nếu chắc chắn thứ tự)
    // Cách 2: Sử dụng expect.arrayContaining và expect.objectContaining để tìm chính xác hơn
    expect(MockButton).toHaveBeenCalledWith(
      expect.objectContaining({
        children: 'Search_Conferences', // Tìm bằng children
        rounded: true,
        size: 'large',
        advanced: true,
        advancedDivColor: 'p-8',
        // Không cần kiểm tra variant vì không được truyền, sẽ lấy default 'primary'
      }),
      expect.anything() // Đối số thứ 2 của function component thường là ref (không dùng ở đây)
    );

    // Kiểm tra cấu trúc DOM của button này (có wrapper)
    const conferenceWrapper = screen.getByTestId('mock-button-wrapper');
    expect(conferenceWrapper).toHaveClass('p-8');
    expect(conferenceWrapper.querySelector('[data-testid="mock-button"]')).toHaveTextContent('Search_Conferences');
  });

  test('passes correct props to the "Search Journals" Button', () => {
    render(<Banner />);

    expect(MockButton).toHaveBeenCalledTimes(2);

    // Kiểm tra props của button "Search Journals"
    expect(MockButton).toHaveBeenCalledWith(
      expect.objectContaining({
        children: 'Search_Journals',
        rounded: true,
        size: 'large',
        variant: 'secondary', // Kiểm tra variant được truyền
        // advanced không được truyền, sẽ là false (default)
      }),
      expect.anything()
    );
     // Đảm bảo advanced là false hoặc không được định nghĩa trong props truyền vào mock này
     const journalButtonCall = MockButton.mock.calls.find((call: { children: string; }[]) => call[0].children === 'Search_Journals');
     expect(journalButtonCall[0].advanced).toBeUndefined(); // Hoặc expect(journalButtonCall[0].advanced).toBe(false); nếu bạn truyền false tường minh

    // Kiểm tra cấu trúc DOM của button này (không có wrapper)
    const journalButton = screen.getByRole('button', { name: 'Search_Journals' });
    expect(journalButton).toBeInTheDocument();
    expect(journalButton.closest('[data-testid="mock-button-wrapper"]')).toBeNull(); // Không nằm trong wrapper

    // Kiểm tra padding của div bao quanh Link của journal button
    const journalLink = screen.getByRole('link', { name: 'Search_Journals' });
    const journalWrapperDiv = journalLink.parentElement; // Div chứa link
    expect(journalWrapperDiv).toHaveClass('px-12', 'sm:px-0', 'sm:py-8');
  });

  test('renders correctly with light theme (covered by previous tests, explicit check)', () => {
    // Test này tương tự test ban đầu nhưng giờ đã có nhiều assertion chi tiết hơn
    render(<Banner />);
    expect(screen.getByRole('heading', { name: 'Slogan_Website' })).toBeInTheDocument();
    expect(screen.getByAltText('Banner Background')).toHaveAttribute('src', '/light.jpg');
    expect(MockButton).toHaveBeenCalledWith(expect.objectContaining({ children: 'Search_Conferences' }), {});
    expect(MockButton).toHaveBeenCalledWith(expect.objectContaining({ children: 'Search_Journals' }), {});
  });

  test('renders correctly with dark theme (covered by previous tests, explicit check)', () => {
    __setMockTheme('dark');
    render(<Banner />);
    expect(screen.getByRole('heading', { name: 'Slogan_Website' })).toBeInTheDocument();
    expect(screen.getByAltText('Banner Background')).toHaveAttribute('src', '/2.png');
    expect(MockButton).toHaveBeenCalledWith(expect.objectContaining({ children: 'Search_Conferences' }), {});
    expect(MockButton).toHaveBeenCalledWith(expect.objectContaining({ children: 'Search_Journals' }), {});
  });

});

