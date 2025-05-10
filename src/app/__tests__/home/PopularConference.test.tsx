import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopularConferences from '@/src/app/[locale]/home/PopularConferences'; // Adjust import path

// --- Mocks ---

// Mock next-intl
jest.mock('next-intl', () => ({
    useTranslations: jest.fn(() => (key: string) => key) // Mock t(key) trả về chính key đó
  }))

// Mock next/navigation Link
jest.mock('@/src/navigation', () => ({ // Điều chỉnh đường dẫn
    Link: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

// Mock EventCard component
jest.mock('@/src/app/[locale]/conferences/EventCard', () => ({ event, className }: any) => ( // Adjust path
  <div data-testid={`event-card-${event.id}`} className={className}>
    <h4>{event.name || 'Mock Conference'}</h4>
    <p>{event.location?.city || 'Mock Location'}</p>
  </div>
));

// Mock usePopularConferences hook
const mockScroll = jest.fn();
const mockSetIsHovering = jest.fn();
let mockHookReturnValue = {
  listConferences: [],
  loading: true,
  error: null,
  scrollerRef: React.createRef(), // Provide a ref for completeness
  scroll: mockScroll,
  isAtStart: true,
  isAtEnd: true,
  setIsHovering: mockSetIsHovering,
};

jest.mock('../../../hooks/home/usePopularConferences', () => ({ // Adjust path
  __esModule: true, // Handle ES module export
  default: jest.fn(() => mockHookReturnValue), // Mock the default export
}));

// Helper function to set the mock return value for specific tests
const setMockPopularConferences = (value: any) => {
  mockHookReturnValue = { ...mockHookReturnValue, ...value }; // Merge defaults with provided value
  // Update the mock implementation to return the new value
  require('../../../hooks/home/usePopularConferences').default.mockImplementation(() => mockHookReturnValue);
};

// Sample conference data
const sampleConferences = [
  { id: 'conf-1', name: 'AI Conf 2024', location: { city: 'San Francisco' } },
  { id: 'conf-2', name: 'Web Dev Summit', location: { city: 'London' } },
  { id: 'conf-3', name: 'Data Science Expo', location: { city: 'Berlin' } },
  { id: 'conf-4', name: 'Cloud Native Fest', location: { city: 'Austin' } },
];


// --- Tests ---

describe('PopularConferences Component', () => {
  beforeEach(() => {
    // Reset mock hook state before each test
    setMockPopularConferences({
      listConferences: [],
      loading: true,
      error: null,
      isAtStart: true,
      isAtEnd: true,
    });
    // Clear mock function calls
    jest.clearAllMocks()
    // Ensure the hook mock itself is reset if needed, though setMockPopularConferences handles value reset
    require('../../../hooks/home/usePopularConferences').default.mockClear(); // Clear calls to the hook constructor itself

  });

  test('renders null when loading and no data', () => {
    setMockPopularConferences({ loading: true, listConferences: [] });
    const { container } = render(<PopularConferences />);
    expect(container.firstChild).toBeNull();
  });

   test('renders null when data is empty array after loading', () => {
    setMockPopularConferences({ loading: false, listConferences: [] });
    const { container } = render(<PopularConferences />);
    expect(container.firstChild).toBeNull();
  });

   test('renders null when data is null after loading', () => {
    setMockPopularConferences({ loading: false, listConferences: null });
    const { container } = render(<PopularConferences />);
    expect(container.firstChild).toBeNull();
  });

  test('renders null on error', () => {
    setMockPopularConferences({ loading: false, error: new Error('Failed to fetch') });
    const { container } = render(<PopularConferences />);
    expect(container.firstChild).toBeNull();
  });

  test('renders title, cards, and controls when data is loaded (multiple items)', () => {
    setMockPopularConferences({
        loading: false,
        listConferences: sampleConferences,
        isAtStart: true, // Initial state
        isAtEnd: false,
    });
    render(<PopularConferences />);

    // Check title
    expect(screen.getByRole('heading', { name: 'Popular_Conferences' })).toBeInTheDocument();

    // Check cards (using mock EventCard testids)
    sampleConferences.forEach(conf => {
      expect(screen.getByTestId(`event-card-${conf.id}`)).toBeInTheDocument();
    });

    // Check scroll buttons
    const scrollLeftButton = screen.getByRole('button', { name: /Scroll Left/i });
    const scrollRightButton = screen.getByRole('button', { name: /Scroll Right/i });
    expect(scrollLeftButton).toBeInTheDocument();
    expect(scrollRightButton).toBeInTheDocument();

    // Check initial button states (start=true, end=false)
    expect(scrollLeftButton).toBeDisabled();
    expect(scrollRightButton).not.toBeDisabled();
  });

   test('renders correctly with only one conference (buttons disabled)', () => {
    const singleConference = [sampleConferences[0]];
     setMockPopularConferences({
        loading: false,
        listConferences: singleConference,
        isAtStart: true,
        isAtEnd: true, // With one item, it's both start and end
    });
    render(<PopularConferences />);

     expect(screen.getByRole('heading', { name: 'Popular_Conferences' })).toBeInTheDocument();
     expect(screen.getByTestId(`event-card-${singleConference[0].id}`)).toBeInTheDocument();

     const scrollLeftButton = screen.getByRole('button', { name: /Scroll Left/i });
     const scrollRightButton = screen.getByRole('button', { name: /Scroll Right/i });
     expect(scrollLeftButton).toBeDisabled();
     expect(scrollRightButton).toBeDisabled();
   });


  test('disables scroll buttons based on isAtStart and isAtEnd from hook', () => {
     setMockPopularConferences({
        loading: false,
        listConferences: sampleConferences,
        isAtStart: false, // Not at start
        isAtEnd: true,   // At end
    });
    render(<PopularConferences />);

    const scrollLeftButton = screen.getByRole('button', { name: /Scroll Left/i });
    const scrollRightButton = screen.getByRole('button', { name: /Scroll Right/i });

    expect(scrollLeftButton).not.toBeDisabled();
    expect(scrollRightButton).toBeDisabled();
  });

  test('calls scroll function from hook on button click', () => {
      setMockPopularConferences({
        loading: false,
        listConferences: sampleConferences,
        isAtStart: false, // Enable both buttons for testing clicks
        isAtEnd: false,
        // scroll: mockScroll - already set in mockHookReturnValue
    });
    const { rerender } = render(<PopularConferences />);

    const scrollLeftButton = screen.getByRole('button', { name: /Scroll Left/i });
    const scrollRightButton = screen.getByRole('button', { name: /Scroll Right/i });

    fireEvent.click(scrollLeftButton);
    expect(mockScroll).toHaveBeenCalledWith('left');
    expect(mockScroll).toHaveBeenCalledTimes(1);

    fireEvent.click(scrollRightButton);
    expect(mockScroll).toHaveBeenCalledWith('right');
    expect(mockScroll).toHaveBeenCalledTimes(2);

    // Test click when disabled (should not call scroll)
    // Re-render with new state where left is disabled
    setMockPopularConferences({ isAtStart: true, isAtEnd: false });
    rerender(<PopularConferences />); // Re-render triggers hook again with new value
    const disabledLeftButton = screen.getByRole('button', { name: /Scroll Left/i });
    expect(disabledLeftButton).toBeDisabled(); // Verify it's disabled
    fireEvent.click(disabledLeftButton);      // Click disabled button
    expect(mockScroll).toHaveBeenCalledTimes(2); // Should not have increased call count
  });

   test('calls setIsHovering from hook on mouse enter/leave', () => {
       setMockPopularConferences({
        loading: false,
        listConferences: sampleConferences,
        // setIsHovering: mockSetIsHovering - already set
    });
    const { container } = render(<PopularConferences />); // Use container to find element if no test-id

    // IMPORTANT: Add data-testid="conference-scroller" to the scrolling div in your component code
    // <div id="conference-scroller" data-testid="conference-scroller" ref={scrollerRef} ... >
    // Sử dụng container.querySelector để tìm bằng ID
    const scroller = container.querySelector('#conference-scroller');
    expect(scroller).toBeInTheDocument();

    // Nếu phần tử tồn tại, tiếp tục thực hiện test
    if (scroller) { // Có thể thêm kiểm tra if cho chắc chắn hơn
        fireEvent.mouseEnter(scroller);
        expect(mockSetIsHovering).toHaveBeenCalledWith(true);
        expect(mockSetIsHovering).toHaveBeenCalledTimes(1);

        fireEvent.mouseLeave(scroller);
        expect(mockSetIsHovering).toHaveBeenCalledWith(false);
        expect(mockSetIsHovering).toHaveBeenCalledTimes(2);
    } else {
        // Fail test nếu không tìm thấy (mặc dù expect ở trên đã làm điều này)
        throw new Error('Could not find element with id #conference-scroller');
    }
  });

  test('applies sm:justify-center class when fewer than 3 conferences', () => {
     setMockPopularConferences({
        loading: false,
        listConferences: sampleConferences.slice(0, 2), // Only 2 conferences
    });

    const { container } = render(<PopularConferences />); // Use container to find element if no test-id
     // Sử dụng container.querySelector để tìm bằng ID
    const scroller = container.querySelector('#conference-scroller');
    expect(scroller).toBeInTheDocument();
    expect(scroller).toHaveClass('sm:justify-center');
  });

  test('does not apply sm:justify-center class when 3 or more conferences', () => {
      setMockPopularConferences({
        loading: false,
        listConferences: sampleConferences, // 4 conferences
    });
    const { container } = render(<PopularConferences />); // Use container to find element if no test-id
    // Sử dụng container.querySelector để tìm bằng ID
    const scroller = container.querySelector('#conference-scroller');
    expect(scroller).toBeInTheDocument();
    expect(scroller).not.toHaveClass('sm:justify-center');
  });

});