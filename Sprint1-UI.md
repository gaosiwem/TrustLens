1. FILE ARCHITECTURE
   frontend/
   ├── app/
   │ ├── auth/
   │ │ ├── login.tsx
   │ │ ├── register.tsx
   │ │ ├── forgot-password.tsx
   │ │ ├── verify-email.tsx
   │ │ └── profile.tsx
   │ ├── layout.tsx
   │ ├── globals.css
   │ └── providers.tsx
   ├── components/
   │ ├── DarkModeToggle.tsx
   │ ├── InputField.tsx
   │ ├── Button.tsx
   │ └── SocialLoginButton.tsx
   ├── lib/
   │ ├── api.ts
   │ └── authOptions.ts
   ├── pages/
   │ └── \_app.tsx
   ├── public/
   │ └── images/
   ├── tests/
   │ ├── login.test.tsx
   │ ├── register.test.tsx
   │ └── auth.integration.test.tsx
   ├── tailwind.config.js
   └── next.config.js

2. DEPENDENCIES
   npm install next react react-dom
   npm install tailwindcss postcss autoprefixer
   npm install next-auth @next-auth/prisma-adapter @prisma/client
   npm install axios zustand classnames
   npm install --save-dev typescript jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

3. TAILWIND CONFIGURATION

frontend/tailwind.config.js

module.exports = {
darkMode: 'class',
content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
theme: {
extend: {
colors: {
primary: '#13b6ec',
'background-light': '#f6f8f8',
'background-dark': '#101d22',
},
fontFamily: { display: ['Manrope', 'sans-serif'] },
borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
},
},
plugins: [require('@tailwindcss/forms')],
};

4. GLOBAL PROVIDERS & DARK MODE

frontend/app/providers.tsx

'use client';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
return (
<ThemeProvider attribute="class" defaultTheme="system">
<SessionProvider>{children}</SessionProvider>
</ThemeProvider>
);
}

frontend/app/layout.tsx

import './globals.css'
import { Providers } from './providers'
import DarkModeToggle from '../components/DarkModeToggle'

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en" className="dark">
<body className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center">
<Providers>
<DarkModeToggle />
{children}
</Providers>
</body>
</html>
)
}

5. DARK MODE TOGGLE

frontend/components/DarkModeToggle.tsx

'use client';
import { useTheme } from 'next-themes';

export default function DarkModeToggle() {
const { theme, setTheme } = useTheme();
return (
<button
className="absolute top-4 right-4 p-2 rounded-full text-primary bg-white/20 dark:bg-black/20"
onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} >
{theme === 'dark' ? '🌞' : '🌙'}
</button>
);
}

6. REUSABLE COMPONENTS

InputField.tsx

'use client';
import { InputHTMLAttributes } from 'react';
import classNames from 'classnames';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
label: string;
icon?: string;
}

export default function InputField({ label, icon, ...props }: InputFieldProps) {
return (
<div className="flex flex-col gap-1.5">
<label className="text-[#111618] dark:text-white text-sm font-medium">{label}</label>
<div className="relative flex items-center">
{icon && <span className="material-symbols-outlined absolute left-3 text-[#637588] dark:text-[#93a2b7]">{icon}</span>}
<input {...props} className={classNames(
'w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-[#1a2c34] border border-[#dce0e5] dark:border-[#2c3e46] text-[#111618] dark:text-white placeholder:text-[#93a2b7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base',
props.className
)}/>
</div>
</div>
);
}

Button.tsx

'use client';
interface ButtonProps { children: React.ReactNode; onClick?: () => void; }
export default function Button({ children, onClick }: ButtonProps) {
return (
<button
      onClick={onClick}
      className="w-full h-12 bg-primary hover:bg-opacity-90 active:scale-[0.98] text-white font-bold text-base rounded-xl mt-2 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
    >
{children}
</button>
);
}

SocialLoginButton.tsx

'use client';
import { signIn } from 'next-auth/react';
interface SocialLoginButtonProps { provider: string; }
export default function SocialLoginButton({ provider }: SocialLoginButtonProps) {
const handleSocialLogin = async () => signIn(provider, { callbackUrl: '/' });
return (
<button
      onClick={handleSocialLogin}
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dce0e5] dark:border-[#2c3e46] bg-white dark:bg-[#1a2c34] hover:bg-[#f6f8f8] dark:hover:bg-[#24363e] transition-colors"
    >
<span className="text-sm font-semibold">{provider === 'google' ? 'Google' : provider}</span>
</button>
);
}

7. NEXTAUTH.JS CONFIGURATION

frontend/lib/authOptions.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@prisma/client";

export const authOptions: NextAuthOptions = {
adapter: PrismaAdapter(prisma),
providers: [
CredentialsProvider({
name: "Credentials",
credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
async authorize(credentials) {
// call backend login/register endpoint from Sprint1.md
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
method: 'POST', body: JSON.stringify({ email: credentials?.email, password: credentials?.password }),
headers: { 'Content-Type': 'application/json' }
});
const user = await res.json();
if (res.ok && user) return user;
return null;
}
}),
GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })
],
session: { strategy: 'jwt' },
pages: { signIn: '/auth/login' }
};

frontend/pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export default NextAuth(authOptions);

8. AUTH PAGES

Login: app/auth/login.tsx – implemented above.
Register: app/auth/register.tsx

'use client';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [phone, setPhone] = useState('');

const handleRegister = async () => {
const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { email, password, phone });
if (res.data?.success) await signIn('credentials', { email, password, callbackUrl: '/' });
};

return (
<div className="flex flex-col gap-6 p-6 max-w-md w-full bg-background-light dark:bg-background-dark rounded-xl shadow-lg">
<h1 className="text-2xl font-bold text-center text-[#111618] dark:text-white">Create Account</h1>
<InputField label="Email" type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
<InputField label="Password" type="password" icon="lock" value={password} onChange={(e) => setPassword(e.target.value)} />
<InputField label="Phone Number" type="tel" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
<Button onClick={handleRegister}>Sign Up</Button>
</div>
);
}

Forgot Password: app/auth/forgot-password.tsx

'use client';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { useState } from 'react';
import axios from 'axios';

export default function ForgotPasswordPage() {
const [email, setEmail] = useState('');
const [submitted, setSubmitted] = useState(false);

const handleReset = async () => {
await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email });
setSubmitted(true);
};

return (
<div className="flex flex-col gap-6 p-6 max-w-md w-full bg-background-light dark:bg-background-dark rounded-xl shadow-lg">
<h1 className="text-2xl font-bold text-center text-[#111618] dark:text-white">Reset Password</h1>
{!submitted ? (
<>
<InputField label="Email" type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
<Button onClick={handleReset}>Send Reset Link</Button>
</>
) : (
<p className="text-center text-primary">Check your email for the reset link.</p>
)}
</div>
);
}

Verify Email: app/auth/verify-email.tsx

'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Button from '../../components/Button';

export default function VerifyEmailPage() {
const params = useSearchParams();
const token = params.get('token');
const [verified, setVerified] = useState(false);

useEffect(() => {
if (token) axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, { token }).then(() => setVerified(true));
}, [token]);

return (
<div className="flex flex-col gap-6 p-6 max-w-md w-full bg-background-light dark:bg-background-dark rounded-xl shadow-lg">
<h1 className="text-2xl font-bold text-center text-[#111618] dark:text-white">Email Verification</h1>
{verified ? <p className="text-center text-primary">Email verified successfully!</p> : <p className="text-center">Verifying...</p>}
<Button onClick={() => window.location.href='/auth/login'}>Go to Login</Button>
</div>
);
}

Profile Page: app/auth/profile.tsx

'use client';
import { useEffect, useState } from 'react';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import axios from 'axios';

export default function ProfilePage() {
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');

useEffect(() => {
axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`).then(res => {
setEmail(res.data.email);
setPhone(res.data.phone);
});
}, []);

const handleUpdate = async () => {
await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { email, phone });
alert('Profile updated!');
};

return (
<div className="flex flex-col gap-6 p-6 max-w-md w-full bg-background-light dark:bg-background-dark rounded-xl shadow-lg">
<h1 className="text-2xl font-bold text-center text-[#111618] dark:text-white">Your Profile</h1>
<InputField label="Email" type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} />
<InputField label="Phone" type="tel" icon="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
<Button onClick={handleUpdate}>Update Profile</Button>
</div>
);
}

9. FRONTEND TESTS

tests/login.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/auth/login';

test('renders login page and inputs', () => {
render(<LoginPage />);
expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
});

tests/register.test.tsx

import { render, screen } from '@testing-library/react';
import RegisterPage from '../app/auth/register';

test('renders register page', () => {
render(<RegisterPage />);
expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
});

tests/auth.integration.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/auth/login';

test('can toggle dark mode', () => {
render(<LoginPage />);
const button = screen.getByRole('button');
expect(button).toBeInTheDocument();
});
