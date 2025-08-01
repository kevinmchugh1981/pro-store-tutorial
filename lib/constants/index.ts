export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pro-Store';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A modern e-commerce platform built with Next.js';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pro-store.vercel.app';

export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCT_LIMIT) || 4;

export const signInDefaultValues = {
    email: '',
    password: ''
}


export const signUpDefaultValues = {
    name:'',
    email: '',
    password: '',
    confirmPassword:''
};

export const shippingAddressDefaultValues = {
fullName: "",
  streetAddress: "",
  city: "",
  postCode: "",
  country: ""
}

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.PAYMENT_METHODS.split(', ') : ['PayPal', 'CreditCard', 'CashOnDelivery'];
export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || 'PayPal';

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: '0',
  stock: 0,
  rating: '0',
  numReviews: '0',
  isFeatured: false,
  banner: null
};

export const USER_ROLES = process.env.USER_ROLES ? process.env.USER_ROLES.split(", ") : ["admin","user"];