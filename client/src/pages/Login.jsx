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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Login Wrapper with high-end card styling */}
            <div className="w-full max-w-5xl bg-card rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
                
                {/* Visual Identity Section - Hidden on Mobile */}
                <div className="hidden md:flex md:w-[45%] bg-primary p-12 text-white flex-col justify-between relative overflow-hidden">
                    {/* Decorative Gradients for depth */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 duration-300">
                                <span className="text-primary font-black text-2xl">E</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">Expentra</span>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter mb-6">
                            Track Your <br />
                            <span className="text-secondary">Money Easily.</span>
                        </h2>
                        
                        <p className="text-white/70 text-base font-medium max-w-xs leading-relaxed">
                            Simple way to manage your daily expenses and savings.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 grid grid-cols-1 gap-6">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 group hover:bg-white/10 transition-all cursor-default">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">1</div>
                            <div>
                                <h4 className="text-sm font-bold">Cloud Sync</h4>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Access everywhere</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 shadow-xl shadow-black/10">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white font-bold">2</div>
                            <div>
                                <h4 className="text-sm font-bold">Group Split</h4>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">With friends & family</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Interaction Section */}
                <div className="w-full md:w-[55%] p-10 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-black text-textColor tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sign in to your account</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-6 py-4 bg-background border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-textColor placeholder-gray-300 font-bold text-sm transition-all duration-300"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-6 py-4 bg-background border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-textColor placeholder-gray-300 font-bold text-sm transition-all duration-300"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>



                            <button
                                type="submit"
                                className="w-full bg-primary py-5 rounded-[20px] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transform transition-all duration-300 hover:-translate-y-1 active:scale-95 mt-4"
                            >
                                Login
                            </button>
                        </form>

                        <div className="mt-12 pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">New to Expentra?</p>
                                <p className="text-sm font-bold text-textColor">Create your free account</p>
                            </div>
                            <Link
                                to="/register"
                                className="px-8 py-3 bg-textColor text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-textColor/90 transition-all hover:shadow-lg active:scale-95"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;