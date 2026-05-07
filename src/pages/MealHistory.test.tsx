import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MealHistory from './MealHistory'
import { useMealHistoryStore } from '../stores/mealHistoryStore'

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <MealHistory />
    </MemoryRouter>
  )
}

describe('MealHistory', () => {
  beforeEach(() => {
    useMealHistoryStore.setState({ entries: {} })
  })

  it('renders empty state when no entries exist', () => {
    renderWithRouter()
    expect(screen.getByText('No Meal History Yet')).toBeInTheDocument()
  })

  it('renders calendar grid when entries exist', () => {
    useMealHistoryStore.setState({
      entries: {
        '2026-05-15': { date: '2026-05-15', name: 'Coconut Curry Lentils', cuisine: 'Indian', rating: 4 },
      },
    })
    renderWithRouter()
    expect(screen.getByText('May 2026')).toBeInTheDocument()
    expect(screen.getByText('Coconut Curry Lentils')).toBeInTheDocument()
  })

  it('expands day details on click', () => {
    useMealHistoryStore.setState({
      entries: {
        '2026-05-10': { date: '2026-05-10', name: 'Thai Basil Stir Fry', cuisine: 'Thai', rating: 5, notes: 'Great flavor!' },
      },
    })
    renderWithRouter()

    const dayButton = screen.getByText('10').closest('button')!
    fireEvent.click(dayButton)

    expect(screen.getAllByText('Thai Basil Stir Fry')).toHaveLength(2)
    expect(screen.getByText('Thai')).toBeInTheDocument()
    expect(screen.getByText('Great flavor!')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Thai Basil Stir Fry' })).toBeInTheDocument()
  })

  it('navigates to previous and next months', () => {
    useMealHistoryStore.setState({
      entries: {
        '2026-05-01': { date: '2026-05-01', name: 'Test Meal' },
      },
    })
    renderWithRouter()

    expect(screen.getByText('May 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Previous month'))
    expect(screen.getByText('April 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Next month'))
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('June 2026')).toBeInTheDocument()
  })
})
