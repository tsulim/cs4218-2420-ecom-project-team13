import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders register form", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('REGISTER FORM')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
  });

  it('should register the user successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
  });

  it('should display error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce({ message: 'User already exists' });
    console.log = jest.fn();

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith({ message: "User already exists" });
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it("should display error message due to invalid credentials", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Invalid Credentials"
      },
      status: 401
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } });

    fireEvent.click(getByText('REGISTER'));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Invalid Credentials");
  })
});