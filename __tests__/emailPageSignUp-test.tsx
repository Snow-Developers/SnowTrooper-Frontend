import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import EmailPage from '../app/SignUpViews/emailPage';


jest.mock('../services/firebaseConfig', () => ({
  __esModule: true,
  default: {},
  db: {},
}));

jest.mock('../context/SignUpContext', () => ({
  useSignUpContext: () => ({
    setSignUpData: jest.fn(),
  }),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  browserLocalPersistence: {},
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: { uid: 'user123' },
    })
  ),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('EmailPage', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });


  test('renders headline text', () => {
    const { getByText } = render(<EmailPage />);
    expect(getByText('Enter Information')).toBeTruthy();
  });

  test('renders all text inputs', () => {
    const { getByPlaceholderText } = render(<EmailPage />);
    expect(getByPlaceholderText('Enter your first name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your last name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
    expect(getByPlaceholderText('Enter a password')).toBeTruthy();
    expect(getByPlaceholderText('Re-enter your password')).toBeTruthy();
  });

  test('renders the Sign Up button', () => {
    const { getByText } = render(<EmailPage />);
    expect(getByText('Sign Up')).toBeTruthy();
  });

  test('navigates to additionalInfo on successful sign up', async () => {
    const { getByPlaceholderText, getByText } = render(<EmailPage />);
    fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Enter a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'password123');
    fireEvent.press(getByText('Sign Up'));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(router.push).toHaveBeenCalledWith('/SignUpViews/additionalInfo');
  });

  test('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getByText } = render(<EmailPage />);
    fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'jane@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Enter a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'password456');
    fireEvent.press(getByText('Sign Up'));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(Alert.alert).toHaveBeenCalledWith('Passwords do not match');
  });

  test('shows error when passwords is less than 6 characters', async () => {
    const { getByPlaceholderText, getByText } = render(<EmailPage />);
    fireEvent.changeText(getByPlaceholderText('Enter your first name'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Enter your last name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'jane@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Enter a password'), 'pass');
    fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'pass');
    fireEvent.press(getByText('Sign Up'));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(Alert.alert).toHaveBeenCalledWith('Password needs to be at least 6 characters long');
  });
});
