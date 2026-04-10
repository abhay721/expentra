import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/auth/login`, {
                email, password
            });
            const { token, role } = res.data;
            login(token, res.data, role);
            toast.success('Welcome back to Expentra!');
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check your email and password.');
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Section - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
                <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-gray-900 font-bold text-xl">E</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">EXPENTRA</span>
                        </div>

                        <h1 className="text-4xl font-bold leading-tight mb-6">
                            Track Your <br />
                            <span className="text-green-400">Money Easily.</span>
                        </h1>

                        <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
                            See where your money goes and save more every month.
                            Join thousands of people using Expentra to manage their daily expenses.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Easy Tracking</h3>
                                    <p className="text-gray-500 text-sm">See all your expenses in one place.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Smart Saving</h3>
                                    <p className="text-gray-500 text-sm">Save your money and reach your goals faster.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800">
                        <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                            Build Your Financial Future With Us
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
                {/* Mobile branding */}
                <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-gray-900">EXPENTRA</span>
                </div>

                <div className="max-w-md w-full">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Login Now
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Enter your details to manage your money
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition"
                                placeholder="•••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition active:scale-95 text-sm"
                        >
                            Login to Account
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;