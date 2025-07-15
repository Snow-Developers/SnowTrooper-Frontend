import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import ContractorOrderProcess from '../app/contractorOrderProcess/[orderId]';

// Mocks
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({
    orderId: 'order123',
    hasArrived: true,
    setHasArrived: jest.fn(),
  })),

  
}));

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  watchPositionAsync: jest.fn((_opts, cb) => {
    cb({
      coords: {
        latitude: 12.34,
        longitude: 56.78,
        accuracy: 5,
        speed: 10,
        heading: 90,
      },
    });
    return Promise.resolve({ remove: jest.fn() });
  }),
  Accuracy: {
    Highest: "highest",
  },
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'driver_123' },
  })),
}));

const mockUpdateDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_db, _col, _id) => ({})),
  getDoc: (...args : any[]) => mockGetDoc(...args),
  updateDoc: (...args : any[]) => mockUpdateDoc(...args),
  setDoc: (...args : any[]) => mockSetDoc(...args),
  serverTimestamp: jest.fn(() => 'mockTimestamp'),
}));

jest.mock('../services/firebaseConfig', () => ({
  db: {},
}));

describe('ContractorOrderProcess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading initially', async () => {
    mockGetDoc.mockResolvedValueOnce(
        new Promise(() => {}) // never resolves
    );

    const { getByText } = render(<ContractorOrderProcess />);

    expect(getByText('Loading order details...')).toBeTruthy();
  });

  it('renders order details after fetch', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        customerFName: 'Jane',
        customerLName: 'Doe',
        customerPhoneNumber: '555-5555',
        streetAddress: '123 Main St',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43215',
      }),
    });

    const { getByText } = render(<ContractorOrderProcess />);

    await waitFor(() => {
      expect(getByText('Name: Jane Doe')).toBeTruthy();
      expect(getByText('Phone: 555-5555')).toBeTruthy();
      expect(
        getByText('Address: 123 Main St, Columbus, OH 43215')
      ).toBeTruthy();
    });
  });

  it('updates order and navigates on arrival button click', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        customerFName: 'Jane',
        customerLName: 'Doe',
        customerPhoneNumber: '555-5555',
        streetAddress: '123 Main St',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43215',
      }),
    });

    const { getByText } = render(<ContractorOrderProcess />);

    await waitFor(() => getByText("I'm Here, Submit Before Photo"));
    fireEvent.press(getByText("I'm Here, Submit Before Photo"));

    await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
        expect(router.push).toHaveBeenCalledWith({
        pathname:
            '/contractorOrderProcess/contractorBeforePhotoVerification',
        params: { orderId: 'order123' },
        });
    });
  });

  it('navigates on Finish Service if hasArrived is true', async () => {
    mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
        customerFName: 'Jane',
        customerLName: 'Doe',
        customerPhoneNumber: '555-5555',
        streetAddress: '123 Main St',
        city: 'Columbus',
        state: 'OH',
        zipCode: '43215',
        }),
    });

    const { getByText } = render(<ContractorOrderProcess />);

    await waitFor(() => getByText('Finish Service'));

    fireEvent.press(getByText('Finish Service'));   // ← press the text itself

    await waitFor(() =>
        expect(router.push).toHaveBeenCalledWith({
        pathname:
            '/contractorOrderProcess/contractorAfterPhotoVerification',
        params: { orderId: 'order123' },
        })
    );
  });

  it('displays current location when tracking', async () => {
     mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
        customerFName: "Jane",
        customerLName: "Doe",
        customerPhoneNumber: "555-5555",
        streetAddress: "123 Main St",
        city: "Columbus",
        state: "OH",
        zipCode: "43215",
        }),
    });

    const { findByText } = render(<ContractorOrderProcess />);

    await findByText("Name: Jane Doe");

    expect(await findByText("Current Location:")).toBeTruthy();
    expect(await findByText("Latitude: 12.340000")).toBeTruthy();
    expect(await findByText("Longitude: 56.780000")).toBeTruthy();
    expect(await findByText("Accuracy: 5 meters")).toBeTruthy();
    });
});
