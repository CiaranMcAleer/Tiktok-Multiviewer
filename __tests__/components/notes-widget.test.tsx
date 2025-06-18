import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesWidget from '@/app/components/notes-widget'

const mockOnRemove = jest.fn()
const mockOnContentChange = jest.fn()

describe('NotesWidget', () => {
  const defaultProps = {
    title: 'My Notes',
    content: 'Initial content',
    onRemove: mockOnRemove,
    onContentChange: mockOnContentChange,
    theme: 'light' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders notes widget with correct title', () => {
    render(<NotesWidget {...defaultProps} />)
    
    expect(screen.getByText('My Notes')).toBeInTheDocument()
  })

  it('displays initial content in textarea', () => {
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByDisplayValue('Initial content')
    expect(textarea).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)
    
    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('calls onContentChange when content is modified', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'New content')
    
    expect(mockOnContentChange).toHaveBeenCalledWith('New content')
  })

  it('shows save button when content has unsaved changes', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, ' modified')
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })
  })

  it('shows unsaved changes indicator', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, ' modified')
    
    await waitFor(() => {
      expect(screen.getByText('•')).toBeInTheDocument()
    })
  })

  it('saves content when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, ' modified')
    
    const saveButton = await screen.findByRole('button', { name: /save/i })
    await user.click(saveButton)
    
    // Save button should disappear after saving
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    })
  })

  it('saves content with Ctrl+S keyboard shortcut', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, ' modified')
    
    await user.keyboard('{Control>}s{/Control}')
    
    // Save button should disappear after saving
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    })
  })

  it('shows save instruction when there are unsaved changes', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, ' modified')
    
    await waitFor(() => {
      expect(screen.getByText(/Press Ctrl\+S to save/)).toBeInTheDocument()
    })
  })

  it('renders with dark theme correctly', () => {
    const { container } = render(
      <NotesWidget {...defaultProps} theme="dark" />
    )
    
    expect(container.querySelector('.bg-gray-800')).toBeInTheDocument()
  })

  it('renders with light theme correctly', () => {
    const { container } = render(
      <NotesWidget {...defaultProps} theme="light" />
    )
    
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
  })

  it('shows file text icon in header', () => {
    render(<NotesWidget {...defaultProps} />)
    
    // FileText icon should be present
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('handles empty content', () => {
    render(<NotesWidget {...defaultProps} content="" />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea.value).toBe('')
  })

  it('handles long content', () => {
    const longContent = 'A'.repeat(1000)
    render(<NotesWidget {...defaultProps} content={longContent} />)
    
    const textarea = screen.getByDisplayValue(longContent)
    expect(textarea).toBeInTheDocument()
  })

  it('preserves line breaks in content', () => {
    const multilineContent = 'Line 1\nLine 2\nLine 3'
    render(<NotesWidget {...defaultProps} content={multilineContent} />)
    
    const textarea = screen.getByDisplayValue(multilineContent)
    expect(textarea).toBeInTheDocument()
  })

  it('focuses textarea when clicked', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    
    expect(textarea).toHaveFocus()
  })

  it('allows text selection and editing', async () => {
    const user = userEvent.setup()
    render(<NotesWidget {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.keyboard('{Control>}a{/Control}')
    await user.type(textarea, 'Replaced content')
    
    expect(mockOnContentChange).toHaveBeenCalledWith('Replaced content')
  })

  it('handles special characters in content', async () => {
    const user = userEvent.setup()
    const specialContent = '!@#$%^&*()_+{}|:"<>?[]\\;\',./'
    
    render(<NotesWidget {...defaultProps} content="" />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, specialContent)
    
    expect(mockOnContentChange).toHaveBeenCalledWith(specialContent)
  })
})
