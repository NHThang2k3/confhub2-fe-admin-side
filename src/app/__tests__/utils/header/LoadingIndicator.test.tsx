// components/Header/components/LoadingIndicator.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // Imports Jest DOM matchers like toHaveAttribute, toHaveClass, etc.
import LoadingIndicator from '@/src/app/[locale]/utils/header/LoadingIndicator' // Import the component being tested

describe('LoadingIndicator Component', () => {
  // Test 1: Check if the component renders without crashing
  test('renders without errors', () => {
    // Simply rendering is often enough to catch initial rendering errors.
    // If render() throws, the test fails.
    const { container } = render(<LoadingIndicator />)

    // Optional: Assert that the component renders *something* into the container.
    // container.firstChild targets the outermost div rendered by the component.
    expect(container.firstChild).toBeInTheDocument()
  })

  // Test 2: Check if the SVG element is rendered
  test('renders the SVG icon', () => {
    // Using container.querySelector is reliable for simple structural checks
    // when roles/text are not applicable.
    // Adding data-testid="loading-svg" to the SVG in the component
    // and using screen.getByTestId('loading-svg') would be even more robust.
    const { container } = render(<LoadingIndicator />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument() // Check if an SVG element exists
  })

  // Test 3: Check specific attributes of the SVG element (using correct attribute names)
  test('renders SVG with correct basic attributes', () => {
    const { container } = render(<LoadingIndicator />)
    const svgElement = container.querySelector('svg')

    expect(svgElement).toHaveAttribute('width', '24')
    expect(svgElement).toHaveAttribute('height', '24')
    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svgElement).toHaveAttribute('stroke', '#ffffff')
    // --- Use kebab-case for SVG attributes ---
    expect(svgElement).toHaveAttribute('stroke-width', '2')
    expect(svgElement).toHaveAttribute('stroke-linecap', 'round')
    expect(svgElement).toHaveAttribute('stroke-linejoin', 'round')
    // --- ---
    expect(svgElement).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(svgElement).toHaveAttribute('fill', 'none') // Added check for fill attribute
  })

  // Test 4: Check for the presence of animation and styling classes on the SVG
  test('SVG element has correct CSS classes', () => {
    const { container } = render(<LoadingIndicator />)
    const svgElement = container.querySelector('svg')

    expect(svgElement).toHaveClass('lucide')
    expect(svgElement).toHaveClass('lucide-log-in')
    expect(svgElement).toHaveClass('mr-2')
    expect(svgElement).toHaveClass('animate-spin') // Important for the loading animation
  })

  // Test 5: Check if the SVG contains path elements (indicating it's not empty)
  test('SVG contains path elements', () => {
    const { container } = render(<LoadingIndicator />)
    const svgElement = container.querySelector('svg')
    const pathElements = svgElement?.querySelectorAll('path') // Use optional chaining for safety

    expect(pathElements).not.toBeNull() // Ensure pathElements is queryable
    expect(pathElements).toHaveLength(2) // Check for exactly two paths
  })

  // Test 6: Check path 'd' attributes (more brittle, use with caution)
  test('SVG path elements have expected "d" attributes', () => {
    const { container } = render(<LoadingIndicator />)
    const pathElements = container.querySelectorAll('svg path')

    // Ensure we have the expected number of paths before accessing them by index
    expect(pathElements).toHaveLength(2)
    expect(pathElements[0]).toHaveAttribute('d', 'M12 22s8-4 8-10V4')
    expect(pathElements[1]).toHaveAttribute('d', 'M12 2s8 4 8 10')
  })

  // Test 7: Check inline styles on path elements (even more brittle, generally avoid)
  test('SVG path elements have expected inline styles for animation', () => {
    const { container } = render(<LoadingIndicator />)
    const pathElements = container.querySelectorAll('svg path')

    // Ensure we have the expected number of paths before accessing them by index
    expect(pathElements).toHaveLength(2)

    // Using toHaveStyle matcher from jest-dom
    expect(pathElements[0]).toHaveStyle('animation: spin 1s linear infinite')
    // Check both parts of the style for the second path
    expect(pathElements[1]).toHaveStyle('animation: spin 1s linear infinite')
    expect(pathElements[1]).toHaveStyle('animation-delay: 0.5s')
    // Alternatively, check the combined style property if applicable/consistent
    // expect(pathElements[1]).toHaveStyle('animation: spin 1s linear infinite; animation-delay: 0.5s;'); // This might be too specific
  })
})
