import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import EmailLoginPage from '../app/LogInViews/emailPage';
import api from '../services/api';


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
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: { uid: 'user123', email: 'john@example.com' },
    })
  ),
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => {}),
  },
  getAPIToken: jest.fn(() => 'mock-token'),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
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
    const { getByText } = render(<EmailLoginPage />);
    expect(getByText('Login with Email')).toBeTruthy();
  });

  test('renders all text inputs', () => {
    const { getByPlaceholderText } = render(<EmailLoginPage />);
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  test('renders the Sign Up button', () => {
    const { getByText } = render(<EmailLoginPage />);
    expect(getByText('Log In')).toBeTruthy();
  });

  test('navigates to customer home page on successful sign up', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: 'Customer' } });
    const { getByPlaceholderText, getByText } = render(<EmailLoginPage />);
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/customerHomeScreen');
    });
  });

  test('navigates to contractor home page on successful sign up', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: 'Contractor' } });
    const { getByPlaceholderText, getByText } = render(<EmailLoginPage />);
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/contractorHomeScreen');
    });
  });
});
