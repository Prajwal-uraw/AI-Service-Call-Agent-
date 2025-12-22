"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Zap, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Kestrel Voice Operations
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered voice operations and call management for modern businesses
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Access Portal <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button size="lg" variant="outline">
                Book a Demo
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Phone className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">24/7 Call Management</h3>
              <p className="text-gray-600">Never miss a customer call with AI-powered voice operations</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Zap className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Instant Response</h3>
              <p className="text-gray-600">Automated responses and intelligent call routing</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Shield className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Bank-level security for all your voice data</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
