import React from 'react';
import { 
  CreditCard, 
  Wallet, 
  Shield, 
  Calendar, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Instant Payments",
      description: "Pay now or split into flexible EMI plans with zero hassle"
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Smart Wallets",
      description: "Custodial or non-custodial wallet creation with enterprise security"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Identity",
      description: "Advanced microdeposit verification for secure transactions"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Flexible Terms",
      description: "Choose from 3, 6, or 12-month payment plans that fit your budget"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime" },
    { number: "2M+", label: "Transactions" },
    { number: "50K+", label: "Active Users" },
    { number: "4.9", label: "Rating" }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-black mb-8 leading-tight">
              Pay Now,
              <br />
              <span className="relative">
                Pay Later
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-black opacity-20"></div>
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The future of payments is here. Split any purchase into flexible EMI plans 
              with enterprise-grade security and instant wallet creation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onGetStarted}
                className="bg-black text-white px-8 py-4 rounded-2xl font-medium text-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 group"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-black border-2 border-black px-8 py-4 rounded-2xl font-medium text-lg hover:bg-black hover:text-white transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Built for the Future
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience next-generation payment technology with features designed 
              for modern commerce and financial flexibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
              >
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl w-fit group-hover:bg-black group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50 relative overflow-hidden">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Simple. Secure. Smart.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three steps to financial freedom with our streamlined payment process.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="mb-8 relative">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Choose Your Payment</h3>
              <p className="text-gray-600 leading-relaxed">
                Select "Pay Now" for instant payment or "Pay with EMI" to explore flexible payment plans.
              </p>
            </div>

            <div className="text-center group">
              <div className="mb-8 relative">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Create & Verify</h3>
              <p className="text-gray-600 leading-relaxed">
                Set up your secure wallet and complete identity verification through our advanced microdeposit system.
              </p>
            </div>

            <div className="text-center group">
              <div className="mb-8 relative">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Enjoy Flexibility</h3>
              <p className="text-gray-600 leading-relaxed">
                Select your preferred EMI plan and enjoy seamless monthly payments with transparent terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                Enterprise-Grade Security
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Your financial data is protected by military-grade encryption and 
                advanced verification systems trusted by millions worldwide.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-1">256-bit SSL Encryption</h3>
                    <p className="text-gray-600">Bank-level security for all transactions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-1">Microdeposit Verification</h3>
                    <p className="text-gray-600">Advanced identity confirmation system</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-1">Custodial & Non-Custodial Options</h3>
                    <p className="text-gray-600">Choose your preferred wallet management style</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gray-50 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white border border-gray-100 rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <Shield className="w-16 h-16 text-black mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-black mb-2">Security Score</h3>
                  <div className="text-5xl font-bold text-black mb-2">95%</div>
                  <p className="text-gray-600">Verification Complete</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Identity Verified</span>
                    <CheckCircle className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wallet Secured</span>
                    <CheckCircle className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">EMI Approved</span>
                    <CheckCircle className="w-5 h-5 text-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join the growing community of users who've transformed their payment experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "PayLater transformed how I manage large purchases. The EMI options are incredibly flexible.",
                author: "Sarah Chen",
                role: "Product Designer"
              },
              {
                quote: "The wallet creation process is seamless, and the security features give me complete peace of mind.",
                author: "Marcus Rodriguez",
                role: "Software Engineer"
              },
              {
                quote: "Finally, a payment solution that understands modern financial needs. Highly recommended!",
                author: "Emily Watson",
                role: "Marketing Director"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-black fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-black">{testimonial.author}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Ready to Transform
            <br />
            Your Payments?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who've already discovered the future of flexible payments. 
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="bg-white text-black px-8 py-4 rounded-2xl font-medium text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 group"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="text-white border-2 border-white px-8 py-4 rounded-2xl font-medium text-lg hover:bg-white hover:text-black transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">PayLater</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The future of flexible payments, built for modern commerce.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-black mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-black transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-black mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-black mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2025 PayLater. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;