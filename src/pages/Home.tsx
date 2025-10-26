import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield,
    Zap,
    Globe,
    Lock,
    ArrowRight,
    BarChart3,
    Wallet,
    Bot
} from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* Animated Background Particles - CSS-only for perf */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 opacity-30 animate-pulse">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-8">
                            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
                                <Shield className="h-12 w-12 text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-6xl font-bold mb-6 text-white">
                            GuardX
                        </h1>
                        <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Advanced DeFi Protection Platform
                        </p>
                        <p className="text-lg text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed card p-6">
                            Protect your crypto assets with AI-powered monitoring, automated emergency responses,
                            and cross-chain portfolio management. GuardX provides institutional-grade security
                            for your DeFi investments.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/app/deposit"
                                className="group px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            >
                                Get Started
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                            <Link
                                to="/app/dashboard"
                                className="px-8 py-4 border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl font-semibold transition-all duration-300"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-20 bg-gray-900/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Why Choose GuardX?
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Comprehensive protection for your DeFi portfolio with cutting-edge technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* AI-Powered Protection */}
                        <div className="group p-8 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl w-fit mb-6 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <Bot className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">AI-Powered Protection</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Advanced machine learning algorithms monitor market conditions 24/7,
                                automatically triggering protective measures when threats are detected.
                            </p>
                        </div>

                        {/* Cross-Chain Support */}
                        <div className="group p-8 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl w-fit mb-6 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <Globe className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">Cross-Chain Support</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Seamlessly manage assets across multiple blockchains including Ethereum,
                                Arbitrum, Polygon, and more with unified protection policies.
                            </p>
                        </div>

                        {/* Real-Time Monitoring */}
                        <div className="group p-8 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl w-fit mb-6 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <BarChart3 className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">Real-Time Monitoring</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Live price feeds from Pyth Network ensure accurate, up-to-the-second
                                market data for precise risk assessment and protection triggers.
                            </p>
                        </div>

                        {/* Automated Emergency Response */}
                        <div className="group p-8 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl w-fit mb-6 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <Zap className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">Emergency Response</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Instant automated responses to market crashes, including asset swaps
                                to stablecoins and emergency withdrawals to protect your capital.
                            </p>
                        </div>

                        {/* Permissionless Deposits */}
                        <div className="group p-8 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl w-fit mb-6 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <Wallet className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">Permissionless Access</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Deposit any token without waiting for admin approval. Our system
                                supports thousands of tokens with automatic price discovery.
                            </p>
                        </div>

                        {/* Institutional Security */}
                        <div className="group p-8 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl w-fit mb-6 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <Lock className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">Institutional Security</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Bank-grade security with multi-signature wallets, time-locked contracts,
                                and comprehensive audit trails for complete peace of mind.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative z-10 py-20 bg-black/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/30"></div>
                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            How GuardX Works
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Simple steps to protect your DeFi investments
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group">
                            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-bold text-cyan-400">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-white">Deposit Assets</h3>
                            <p className="text-gray-400">
                                Connect your wallet and deposit any supported cryptocurrency.
                                No minimum amounts or approval processes required.
                            </p>
                        </div>

                        <div className="text-center group">
                            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-bold text-cyan-400">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-white">Set Protection Policies</h3>
                            <p className="text-gray-400">
                                Configure your risk tolerance, crash thresholds, and preferred
                                emergency actions. Customize protection to match your strategy.
                            </p>
                        </div>

                        <div className="text-center group">
                            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-bold text-cyan-400">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-white">Relax & Monitor</h3>
                            <p className="text-gray-400">
                                Our AI monitors your portfolio 24/7, automatically executing
                                protective measures when market conditions threaten your assets.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-20 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div className="group">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> $2.4M+ </div>
                            <div className="text-gray-400">Total Value Protected</div>
                            <div className="w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">1,247</div>
                            <div className="text-gray-400">Active Users</div>
                            <div className="w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">99.9%</div>
                            <div className="text-gray-400">Uptime</div>
                            <div className="w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">2,500+</div>
                            <div className="text-gray-400">Supported Tokens</div>
                            <div className="w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 bg-black/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Ready to Protect Your Assets?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8 backdrop-blur-sm bg-black/20 rounded-xl p-4 border border-gray-700/50">
                        Join thousands of users who trust GuardX to safeguard their DeFi investments
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/app/deposit"
                            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black rounded-xl font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] backdrop-blur-sm"
                        >
                            Start Protecting Now
                            <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        </Link>
                        <Link
                            to="/app/prices"
                            className="px-8 py-4 border border-cyan-500/50 text-white rounded-xl font-semibold hover:border-cyan-400/80 transition-all duration-300 backdrop-blur-sm hover:bg-cyan-500/10"
                        >
                            View Live Prices
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-gray-900/80 border-t border-cyan-500/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                    <Shield className="h-6 w-6 text-cyan-400" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">GuardX</span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-md backdrop-blur-sm bg-black/20 rounded p-3 border border-gray-700/50">
                                Advanced DeFi protection platform providing AI-powered monitoring
                                and automated emergency responses for your crypto assets.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-ping"></div>
                                    <span>All Systems Operational</span>
                                </div>
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Platform</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/app/dashboard" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/deposit" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Deposit
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/policies" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Protection Policies
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/prices" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Live Prices
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/app/audit" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Audit Trail
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Resources</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        API Reference
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Security Audits
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Bug Bounty
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                                        Support
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800/50 mt-12 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-gray-400 text-sm mb-4 md:mb-0">
                                © 2024 GuardX. All rights reserved.
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <a href="#" className="hover:text-cyan-400 transition-colors duration-200">Privacy Policy</a>
                                <a href="#" className="hover:text-cyan-400 transition-colors duration-200">Terms of Service</a>
                                <a href="#" className="hover:text-cyan-400 transition-colors duration-200">Risk Disclosure</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default React.memo(Home);