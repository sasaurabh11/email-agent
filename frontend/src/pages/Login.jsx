import React from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Shield, Sparkles, LogIn, LogOut, User, ChevronRight, CheckCircle, AlertTriangle, Info } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isAuthenticated ? (
          <div className="glass border-gray-700 rounded-2xl p-8 shadow-2xl">
            {/* Warning Section for Unverified App */}
            <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4 mb-6">
              <div className="flex items-start mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                <h2 className="text-amber-300 font-bold">Important Notice:</h2>
              </div>
              <div className="text-amber-100 text-sm space-y-2">
                <p>This app is currently unverified by Google. To proceed:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click "Sign in with Google" below</li>
                  <li>You'll see a warning screen - click <span className="font-semibold">"Advanced"</span></li>
                  <li>Select <span className="font-semibold">"Go to email-agent-3k9o.onrender.com"</span></li>
                  <li>On the next screen, you <span className="font-semibold underline">must enable both permissions</span>:
                    <ul className="list-disc pl-5 mt-1">
                      <li>View your email messages and settings</li>
                      <li>View and edit events on all your calendars</li>
                    </ul>
                  </li>
                </ol>
                <div className="flex items-start mt-2">
                  <Info className="w-4 h-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs">These permissions are required for the app to function properly.</p>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to FocusMail</h1>
              <p className="text-gray-400">Your AI-powered email assistant</p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-400 mr-3" />
                <span className="text-gray-300">AI-powered email classification</span>
              </div>
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-400 mr-3" />
                <span className="text-gray-300">Smart email summarization</span>
              </div>
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-400 mr-3" />
                <span className="text-gray-300">Advanced search with AI</span>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <div className="flex items-center">
                <LogIn className="w-5 h-5 mr-3" />
                <span>Sign in with Google</span>
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        ) : (
          <div className="glass border-gray-700 rounded-2xl p-8 shadow-2xl text-center">
            {/* Success State */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-gray-400 mb-1">You're successfully signed in as</p>
            
            <div className="flex items-center justify-center bg-gray-800/50 rounded-lg p-3 mb-6">
              <User className="w-5 h-5 text-indigo-400 mr-2" />
              <span className="text-white font-medium">{user?.email}</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center text-sm text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Email access granted</span>
              </div>
              <div className="flex items-center justify-center text-sm text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>AI features enabled</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Sign out</span>
            </button>

            <div className="mt-6 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <p className="text-sm text-indigo-300">
                Ready to organize your inbox with AI power?
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FocusMail AI • Privacy • Terms
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;