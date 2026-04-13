import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'personal',
    });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/auth/register`, formData);
            const { token, role } = res.data;
            login(token, res.data, role);
            toast.success('Registration successful! Welcome.');
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Registration Wrapper with high-end card styling */}
            <div className="w-full max-w-5xl bg-card rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[650px] animate-in fade-in zoom-in-95 duration-500">
                
                {/* Visual Identity Section - Hidden on Mobile */}
                <div className="hidden md:flex md:w-[45%] bg-primary p-12 text-white flex-col justify-between relative overflow-hidden">
                    {/* Decorative Gradients */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/20 rounded-full -ml-32 -mt-32 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32 blur-2xl" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 duration-300">
                                <span className="text-primary font-black text-2xl">E</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">Expentra</span>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter mb-6">
                            Create Your <br />
                            <span className="text-secondary">Free Account.</span>
                        </h2>
                        
                        <p className="text-white/70 text-base font-medium max-w-xs leading-relaxed">
                            Start tracking your money and expenses in seconds.
                        </p>
                    </div>

                    {/* Trust Indicators */}
                    <div className="relative z-10 mt-12 space-y-4">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black">✓</div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Bank Grade Security</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 opacity-60">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">✓</div>
                            <p className="text-xs font-bold uppercase tracking-widest">100% Privacy Choice</p>
                        </div>
                    </div>
                </div>

                {/* Registration Interaction Section */}
                <div className="w-full md:w-[55%] p-10 lg:p-14 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8 text-center md:text-left">
                            <h1 className="text-3xl font-black text-textColor tracking-tight mb-2">Create Account</h1>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Join the Expentra family</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-5">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                        Name
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        className="w-full px-6 py-3.5 bg-background border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-textColor placeholder-gray-300 font-bold text-sm transition-all duration-300"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                        Email
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="w-full px-6 py-3.5 bg-background border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-textColor placeholder-gray-300 font-bold text-sm transition-all duration-300"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                        Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        className="w-full px-6 py-3.5 bg-background border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-textColor placeholder-gray-300 font-bold text-sm transition-all duration-300"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary py-4 rounded-[20px] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transform transition-all duration-300 hover:-translate-y-1 active:scale-95 mt-4"
                            >
                                Create Account
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Already have an account?</p>
                                <p className="text-sm font-bold text-textColor">Login to your account</p>
                            </div>
                            <Link
                                to="/login"
                                className="px-8 py-3 bg-secondary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary/90 transition-all hover:shadow-lg active:scale-95 shadow-md shadow-secondary/20"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;