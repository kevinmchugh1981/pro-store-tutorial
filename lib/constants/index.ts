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