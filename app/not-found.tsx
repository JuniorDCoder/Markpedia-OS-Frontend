'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, FileText, Target, Users, Book, Building } from 'lucide-react';

export default function NotFound() {
    const floatingVariants = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const quickLinks = [
        { href: '/strategy/goals', label: 'Goals & OKRs', icon: Target },
        { href: '/strategy/organigram', label: 'Organigram', icon: Users },
        { href: '/resources', label: 'Resources', icon: Book },
        { href: '/strategy/journal', label: 'Journal', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="text-center max-w-2xl mx-auto relative">
                {/* Animated Background Elements */}
                <motion.div
                    className="absolute -top-20 -left-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    variants={floatingVariants}
                    animate="animate"
                />
                <motion.div
                    className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    variants={floatingVariants}
                    animate="animate"
                    transition={{ delay: 1 }}
                />
                <motion.div
                    className="absolute -bottom-20 left-20 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    variants={floatingVariants}
                    animate="animate"
                    transition={{ delay: 2 }}
                />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10"
                >
                    {/* 404 Number */}
                    <motion.div
                        variants={itemVariants}
                        className="relative mb-8"
                    >
                        <motion.div
                            className="text-9xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                            animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            404
                        </motion.div>

                        {/* Floating Icons */}
                        <motion.div
                            className="absolute top-10 -left-10"
                            animate={{
                                y: [0, -15, 0],
                                rotate: [0, 5, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                        >
                            <FileText className="w-8 h-8 text-blue-400 opacity-60" />
                        </motion.div>
                        <motion.div
                            className="absolute top-5 -right-10"
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, -3, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                        >
                            <Target className="w-6 h-6 text-purple-400 opacity-60" />
                        </motion.div>
                        <motion.div
                            className="absolute -bottom-5 left-20"
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 2, 0],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1.5
                            }}
                        >
                            <Users className="w-4 h-4 text-pink-400 opacity-60" />
                        </motion.div>
                    </motion.div>

                    {/* Text Content */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Page Not Found
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 mb-8 max-w-md mx-auto"
                    >
                        Looks like this page took a wrong turn. Let's get you back on track.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        variants={itemVariants}
                        className="relative max-w-md mx-auto mb-8"
                    >
                        <div className="flex items-center bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover-lift">
                            <Search className="w-5 h-5 text-gray-400 ml-2 mr-3" />
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
                            />
                            <Button className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                Search
                            </Button>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                    >
                        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-lift">
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="w-5 h-5" />
                                Back to Home
                            </Link>
                        </Button>

                        <Button asChild variant="outline" size="lg" className="hover-lift">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <ArrowLeft className="w-5 h-5" />
                                Dashboard
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-200 pt-8"
                    >
                        <p className="text-sm text-gray-500 mb-6">Try these popular pages:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {quickLinks.map((link, index) => {
                                const IconComponent = link.icon;
                                return (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + (index * 0.1) }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover-lift group"
                                        >
                                            <IconComponent className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium text-center">{link.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Subtle Grid Background */}
                <div className="absolute inset-0 -z-10 opacity-[0.03]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}