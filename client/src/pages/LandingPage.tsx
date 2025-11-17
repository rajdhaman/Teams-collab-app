import { useState } from "react";
import { Menu, X, Zap, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  // if (user) {
  //   navigate("/dashboard");
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CollabEdge
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Benefits
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Pricing
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t space-y-3">
              <a
                href="#features"
                className="block text-gray-700 hover:text-blue-600"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="block text-gray-700 hover:text-blue-600"
              >
                Benefits
              </a>
              <a
                href="#pricing"
                className="block text-gray-700 hover:text-blue-600"
              >
                Pricing
              </a>
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 px-4 py-2 text-blue-600 font-medium border border-blue-600 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Collaborate, Create,
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Succeed
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Manage teams, projects, and tasks in one powerful platform. Built
              for teams that want to work smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-600 transition"
              >
                Sign In
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✓ Free to get started • ✓ No credit card required • ✓ Takes 2
              minutes
            </p>
          </div>

          {/* Illustration */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-blue-200 rounded w-4/6"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage teams and projects effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Team Management",
                description:
                  "Organize your team, assign roles, and manage permissions with ease",
              },
              {
                icon: CheckCircle,
                title: "Task Tracking",
                description:
                  "Create, assign, and track tasks with real-time updates and status",
              },
              {
                icon: Zap,
                title: "Real-time Collaboration",
                description:
                  "Work together in real-time with instant notifications and updates",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-purple-600">
                  <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-16">
            Why Teams Choose Kriscent
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              "Centralized communication and task management",
              "Real-time notifications and updates",
              "Role-based access control",
              "Intuitive and user-friendly interface",
              "Secure and reliable infrastructure",
              "Mobile-friendly design",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to transform your team collaboration?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using Kriscent to manage their work
            better.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition inline-flex items-center gap-2"
          >
            Start Your Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
     <Footer />
    </div>
  );
}

