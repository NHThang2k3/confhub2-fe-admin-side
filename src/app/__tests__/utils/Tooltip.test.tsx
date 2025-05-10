// components/Tooltip.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom' // Đảm bảo các matchers được import
import Tooltip from '@/src/app/[locale]/utils/Tooltip' // Đường dẫn tới component của bạn

describe('Tooltip Component', () => {
  const tooltipText = 'Đây là nội dung tooltip'
  const childrenText = 'Di chuột qua tôi'

  // --- Test 1: Render cơ bản và tooltip ẩn ban đầu ---
  test('renders children and tooltip text is initially hidden', () => {
    render(
      <Tooltip text={tooltipText}>
        <span>{childrenText}</span>
      </Tooltip>
    )

    // Kiểm tra xem children có được render không
    expect(screen.getByText(childrenText)).toBeInTheDocument()

    // Kiểm tra xem nội dung tooltip có hiển thị ban đầu không
    // Sử dụng queryByText vì nó trả về null nếu không tìm thấy (thay vì báo lỗi như getByText)
    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument()
  })

  // --- Test 2: Hiển thị tooltip khi di chuột vào ---
  test('shows tooltip on mouse enter', () => {
    render(
      <Tooltip text={tooltipText}>
        <span>{childrenText}</span>
      </Tooltip>
    )

    // Lấy phần tử chứa children (là phần tử trigger sự kiện)
    const triggerElement = screen.getByText(childrenText).parentElement // Lấy thẻ div bao ngoài
    expect(triggerElement).toBeInTheDocument() // Đảm bảo đã lấy đúng

    if (triggerElement) {
      // Simulate sự kiện di chuột vào
      fireEvent.mouseEnter(triggerElement)

      // Kiểm tra xem tooltip có hiển thị không và nội dung có đúng không
      expect(screen.getByText(tooltipText)).toBeInTheDocument()
    } else {
      throw new Error('Trigger element not found') // Lỗi nếu không tìm thấy phần tử cha
    }
  })

  // --- Test 3: Ẩn tooltip khi di chuột ra ---
  test('hides tooltip on mouse leave', () => {
    render(
      <Tooltip text={tooltipText}>
        <span>{childrenText}</span>
      </Tooltip>
    )

    const triggerElement = screen.getByText(childrenText).parentElement
    expect(triggerElement).toBeInTheDocument()

    if (triggerElement) {
      // Bước 1: Di chuột vào để hiển thị tooltip
      fireEvent.mouseEnter(triggerElement)
      expect(screen.getByText(tooltipText)).toBeInTheDocument() // Đảm bảo tooltip đã hiện

      // Bước 2: Di chuột ra
      fireEvent.mouseLeave(triggerElement)

      // Kiểm tra xem tooltip có bị ẩn đi không
      expect(screen.queryByText(tooltipText)).not.toBeInTheDocument()
    } else {
      throw new Error('Trigger element not found')
    }
  })

  // --- Test 4: Tooltip vẫn hiển thị children khi đang hiển thị ---
  test('keeps children rendered when tooltip is visible', () => {
    render(
      <Tooltip text={tooltipText}>
        <button>{childrenText}</button> {/* Sử dụng button làm ví dụ */}
      </Tooltip>
    )

    const triggerElement = screen.getByRole('button', {
      name: childrenText
    }).parentElement
    expect(triggerElement).toBeInTheDocument()

    if (triggerElement) {
      // Di chuột vào để hiển thị tooltip
      fireEvent.mouseEnter(triggerElement)

      // Kiểm tra cả tooltip và children đều có mặt
      expect(screen.getByText(tooltipText)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: childrenText })
      ).toBeInTheDocument()
    } else {
      throw new Error('Trigger element not found')
    }
  })
})
