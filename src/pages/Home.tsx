import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Zap,
    Globe,
    Lock,
    ArrowRight,
    BarChart3,
    Wallet,
    Bot,
    ChevronRight, // Added for a cleaner arrow look in navigation
    Code, // New icon for resources/docs
} from 'lucide-react';
import { motion, useInView, useAnimation } from 'framer-motion';

// --- Theme Colors ---
// Dark Base: #030812 (rgb(3, 8, 18))
// Accent Red: #ee3e06 (rgb(238, 62, 6))
// Clean Text/Secondary Bg: #e8eaed (for contrast on dark) or #1e293b (slate-800 for dark backgrounds)

const Home: React.FC = () => {
    const controls = useAnimation();
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [inView, controls]);

    // Simplified, subtle background effect for professionalism
    const SubtleBackground = () => (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Subtle radial gradient focus on the center */}
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 15%, #ee3e0633, transparent 40%)' }} />
        </div>
    );

    // Standard entrance animations (clean, focused)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: 'easeOut' },
        },
    };

    return (
        // Changed text-white to a more professional off-white/gray for better readability
        <div className="min-h-screen text-gray-200 overflow-x-hidden" style={{ backgroundColor: '#030812' }}>
            <SubtleBackground />

            {/* Header / Nav Placeholder (Implied from a professional design) */}
            <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(3, 8, 18, 0.9)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Logo/Brand Icon */}
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#ee3e06' }}>
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-semibold text-white">GuardX</span>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        {['Features', 'How It Works', 'Security', 'Pricing'].map(item => (
                            <Link
                                key={item}
                                to={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                                className="text-gray-400 hover:text-[#ee3e06] transition-colors font-medium"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>
                    <Link
                        to="/app/dashboard"
                        className="px-4 py-2 text-[#ee3e06] border border-[#ee3e06]/50 rounded-lg hover:bg-[#ee3e06]/10 transition-colors font-medium"
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            {/* --- Hero Section: Clean, Centered, Focused --- */}
            <section className="relative z-10 pt-24 pb-32" style={{ minHeight: '80vh' }}>
                <motion.div
                    className="max-w-4xl mx-auto px-6 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="mb-6">
                        <Link
                            to="/app/audit"
                            className="inline-flex items-center text-sm font-medium rounded-full py-1.5 px-4 transition-all"
                            style={{ backgroundColor: 'rgba(238, 62, 6, 0.1)', color: '#ee3e06' }}
                        >
                            <span className="mr-2">🚀 Institutional-Grade Security Audits Completed</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </motion.div>

                    <motion.h1
                        className="text-7xl font-extrabold mb-6 leading-tight"
                        variants={itemVariants}
                        style={{ color: '#e8eaed' }} // Professional bright white/off-white
                    >
                        <span className="bg-gradient-to-r from-[#ee3e06] to-red-500 bg-clip-text text-transparent">Protect</span> Your DeFi Assets with AI Precision.
                    </motion.h1>

                    <motion.p
                        className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
                        variants={itemVariants}
                    >
                        GuardX provides non-custodial, AI-powered monitoring and automated emergency responses to safeguard your crypto portfolio against sudden market crashes and exploits.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        variants={itemVariants}
                    >
                        <Link
                            to="/app/deposit"
                            className="group px-8 py-4 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            style={{ backgroundColor: '#ee3e06', boxShadow: '0 8px 25px rgba(238, 62, 6, 0.4)' }}
                        >
                            Start Protecting Now
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/app/dashboard"
                            className="px-8 py-4 border text-gray-300 rounded-xl font-semibold transition-all duration-300 hover:text-white"
                            style={{ borderColor: 'rgba(238, 62, 6, 0.3)', backgroundColor: 'transparent' }}
                        >
                            View Live Demo
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- Stats/Trust Bar Section: Simple & Quantitative --- */}
            <section className="relative z-10 py-16 border-t border-b" style={{ borderColor: 'rgba(238, 62, 6, 0.1)' }}>
                <motion.div
                    className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                    initial="hidden"
                    whileInView="visible"
                    variants={containerVariants}
                >
                    {[
                        { value: '$2.4M+', label: 'Value Protected' },
                        { value: '1,247', label: 'Active Policies' },
                        { value: '99.9%', label: 'Response Success' },
                        { value: '2,500+', label: 'Supported Tokens' }
                    ].map((stat, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <motion.div
                                className="text-4xl font-extrabold mb-1"
                                style={{ color: '#ee3e06' }}
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-gray-400 text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* --- Features Section: Two-Column Layout for Clarity --- */}
            <section id="features" className="relative z-10 py-24">
                <motion.div
                    className="relative max-w-7xl mx-auto px-6"
                    ref={ref}
                    initial="hidden"
                    animate={controls}
                    variants={containerVariants}
                >
                    <motion.div className="text-center mb-16 max-w-3xl mx-auto" variants={itemVariants}>
                        <h2 className="text-4xl font-bold mb-4 text-white">
                            Institutional Security, Decentralized.
                        </h2>
                        <p className="text-lg text-gray-400">
                            Our platform is built on principles of trustlessness, efficiency, and real-time response.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16"
                        variants={containerVariants}
                    >
                        {[
                            {
                                icon: Bot,
                                title: 'AI-Powered Risk Engine',
                                desc: 'Machine learning algorithms continuously analyze on-chain data and market sentiment, predicting and neutralizing threats before they impact your portfolio.',
                            },
                            {
                                icon: Zap,
                                title: 'Instant Automated Response',
                                desc: 'Emergency protocols, including asset swaps to stablecoins or safe withdrawals, are executed autonomously in milliseconds upon threshold breach.',
                            },
                            {
                                icon: Globe,
                                title: 'Unified Cross-Chain Portfolio',
                                desc: 'Manage and protect assets across all major EVM and non-EVM chains from a single, intuitive interface with a unified security policy.',
                            },
                            {
                                icon: Lock,
                                title: 'Non-Custodial & Trustless',
                                desc: 'Your keys, your crypto. GuardX is a smart-contract layer; we never have access to your private keys or the ability to move assets without your pre-defined policy.',
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-start gap-6 p-6 rounded-xl transition-all duration-300 group hover:bg-[#1a1f2e] hover:shadow-xl"
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                            >
                                <div
                                    className="p-3 rounded-xl flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(238, 62, 6, 0.1)', border: '1px solid rgba(238, 62, 6, 0.3)' }}
                                >
                                    <feature.icon className="h-7 w-7" style={{ color: '#ee3e06' }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#ee3e06]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* --- How It Works Section: Process Flow --- */}
            <section id="how-it-works" className="relative z-10 py-24 bg-gray-900/10 border-t border-b" style={{ borderColor: 'rgba(238, 62, 6, 0.1)' }}>
                <motion.div className="relative max-w-7xl mx-auto px-6" initial="hidden" whileInView="visible" variants={containerVariants}>
                    <motion.div className="text-center mb-16 max-w-3xl mx-auto" variants={itemVariants}>
                        <h2 className="text-4xl font-bold mb-4 text-white">
                            Three Steps to Total Protection
                        </h2>
                        <p className="text-lg text-gray-400">
                            Get started in minutes without lengthy approvals or complex configurations.
                        </p>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-10" variants={containerVariants}>
                        {[
                            { num: '01', title: 'Connect & Deposit', desc: 'Connect your preferred wallet. Deposit any supported token into your GuardX protected vault. Non-custodial always.' },
                            { num: '02', title: 'Define Policy', desc: 'Set your key protection thresholds (e.g., loss limits) and define your emergency action (e.g., swap to USDC/ETH).' },
                            { num: '03', title: 'Live Monitoring', desc: 'The GuardX AI continuously monitors market risk, asset volatility, and network health, ready to execute your policy instantly.' }
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                className="text-left group border-t-4 pt-6 rounded-t-lg transition-all duration-300"
                                style={{ borderColor: '#ee3e06' }}
                                variants={itemVariants}
                                whileHover={{ backgroundColor: '#0f1419' }}
                            >
                                <span className="text-5xl font-extrabold mb-4 block" style={{ color: '#ee3e06' }}>{step.num}</span>
                                <h3 className="text-xl font-semibold mb-3 text-white">
                                    {step.title}
                                </h3>
                                <p className="text-gray-400">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* --- CTA Section: Clear Call to Action --- */}
            <section className="relative z-10 py-24">
                <motion.div
                    className="relative max-w-4xl mx-auto px-6 text-center p-12 rounded-2xl"
                    style={{ backgroundColor: '#0f1419', border: '1px solid rgba(238, 62, 6, 0.2)' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2 className="text-4xl font-bold mb-4 text-white">
                        Your DeFi Security Starts Here.
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 mb-8"
                    >
                        Secure your assets against market volatility and smart contract risk today.
                    </motion.p>
                    <motion.div className="flex justify-center" variants={containerVariants}>
                        <Link
                            to="/app/deposit"
                            className="px-8 py-4 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            style={{ backgroundColor: '#ee3e06', boxShadow: '0 8px 25px rgba(238, 62, 6, 0.4)' }}
                        >
                            <Shield className="h-5 w-5" />
                            Secure My Portfolio
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- Footer: Clean, Segmented, Professional --- */}
            <motion.footer
                className="relative z-10 border-t"
                style={{ backgroundColor: '#030812', borderColor: 'rgba(238, 62, 6, 0.1)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-5 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        variants={containerVariants}
                    >
                        {/* Brand Column */}
                        <motion.div className="col-span-2 md:col-span-2" variants={itemVariants}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ee3e06' }}>
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-semibold text-white">GuardX</span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-md">
                                The non-custodial DeFi protection platform, powered by AI and secured by smart contracts.
                            </p>
                        </motion.div>

                        {/* Platform Links */}
                        <motion.div variants={itemVariants}>
                            <h3 className="text-lg font-semibold mb-4 text-white">Platform</h3>
                            <ul className="space-y-3">
                                {['Dashboard', 'Deposit', 'Policies', 'Live Prices', 'Audit Trail'].map((label, index) => (
                                    <motion.li key={index}>
                                        <Link
                                            to={`/app/${label.toLowerCase().replace(/\s/g, '-')}`}
                                            className="text-gray-400 hover:text-[#ee3e06] transition-colors text-sm"
                                        >
                                            {label}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Resources Links */}
                        <motion.div variants={itemVariants}>
                            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
                            <ul className="space-y-3">
                                {['Documentation', 'API Reference', 'Security Audits', 'Bug Bounty', 'Support'].map((label, index) => (
                                    <motion.li key={index}>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-[#ee3e06] transition-colors text-sm"
                                        >
                                            {label}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Legal/Contact */}
                        <motion.div variants={itemVariants}>
                            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
                            <ul className="space-y-3">
                                {['Privacy Policy', 'Terms of Service', 'Risk Disclosure'].map((label, index) => (
                                    <motion.li key={index}>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-[#ee3e06] transition-colors text-sm"
                                        >
                                            {label}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Bottom Footer Line */}
                    <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                        <div className="text-gray-500 mb-4 md:mb-0">
                            © 2024 GuardX. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    className="w-2.5 h-2.5 bg-[#ee3e06] rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span>All Systems Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default React.memo(Home);