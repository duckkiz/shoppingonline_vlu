import axios from 'axios';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios');

const product = {
  _id: 'product-1',
  name: 'Test product',
  price: 25,
  image: 'aW1hZ2U=',
  category: { name: 'Test category' },
};

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  axios.get.mockImplementation((url) => {
    if (url === '/api/customer/categories') {
      return Promise.resolve({ data: [{ _id: 'category-1', name: 'Test category' }] });
    }
    if (url === '/api/customer/products/new') {
      return Promise.resolve({ data: [product] });
    }
    if (url === '/api/customer/products/hot') {
      return Promise.resolve({ data: [] });
    }
    if (url === '/api/customer/products/product-1') {
      return Promise.resolve({ data: product });
    }
    return Promise.resolve({ data: [] });
  });
});

test('redirects to the customer home and renders its products', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'NEW PRODUCTS' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Test category' })).toHaveAttribute(
    'href',
    '/product/category/category-1',
  );
  expect(screen.getByRole('link', { name: /Test product/ })).toHaveAttribute(
    'href',
    '/product/product-1',
  );
});

test('renders product details when its route is opened directly', async () => {
  window.history.replaceState({}, '', '/product/product-1');
  render(<App />);

  expect(await screen.findByText('Test category', { selector: 'figcaption' })).toBeInTheDocument();
  expect(screen.getByText('Test product')).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toHaveValue(1);
  expect(screen.getByRole('button', { name: 'ADD TO CART' })).toBeInTheDocument();
});
