"use client";

import { useState } from "react";
import {
  Search,
  Book,
  HelpCircle,
  MessageSquare,
  Mail,
  ChevronRight,
  ExternalLink,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Link from "next/link";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: Book,
      count: 12,
      description:
        "Learn the basics of using TrustLens as a consumer or brand.",
    },
    {
      title: "Complaint Management",
      icon: HelpCircle,
      count: 24,
      description: "How to file, track, and resolve complaints effectively.",
    },
    {
      title: "Brand Verification",
      icon: Shield,
      count: 15,
      description:
        "Everything you need to know about becoming a verified brand.",
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      count: 8,
      description: "How we protect your data and maintain trust.",
    },
  ];

  const faqs = [
    { question: "How do I file a new complaint?", category: "Getting Started" },
    {
      question: "What is the Verification Badge?",
      category: "Brand Verification",
    },
    {
      question: "How long does a resolution typically take?",
      category: "Complaint Management",
    },
    {
      question: "Can I edit a complaint after submission?",
      category: "Complaint Management",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 border-b border-border py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter italic">
            How can we <span className="text-primary">help you?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Search our knowledge base or browse categories below to find answers
            to your questions.
          </p>
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for articles, topics, or keywords..."
              className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 space-y-16">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Card
              key={idx}
              className="group hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden border-border/60"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/5 px-2 py-1 rounded">
                    {cat.count} Articles
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Questions & Support */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* FAQ List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 italic">
              <HelpCircle className="w-6 h-6 text-primary" />
              Popular Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                      {faq.category}
                    </span>
                    <span className="font-bold text-sm">{faq.question}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full text-xs font-bold py-4">
              View All FAQ Articles
            </Button>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 italic">
              <MessageSquare className="w-6 h-6 text-primary" />
              Need more help?
            </h2>
            <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <CardContent className="p-6 space-y-6 relative z-10">
                <p className="font-medium text-white/90 leading-relaxed italic">
                  Our support team is available 24/7 to help you with any
                  technical issues or trust-related questions.
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-black shadow-lg">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 font-black"
                  >
                    Live Chat (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center text-center space-y-4">
              <Shield className="w-10 h-10 text-muted-foreground/30" />
              <div>
                <h4 className="font-bold text-sm">Trust & Safety Center</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Report abuse or security vulnerabilities.
                </p>
              </div>
              <Link
                href="/safety"
                className="text-xs font-bold text-primary flex items-center hover:underline"
              >
                Visit Safety Center
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer-like bottom area */}
      <footer className="border-t border-border py-12 px-4 bg-muted/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black italic">
              T
            </div>
            <span className="font-black text-xl tracking-tighter italic">
              Trust<span className="text-primary">Lens</span> Support
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 TrustLens Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
