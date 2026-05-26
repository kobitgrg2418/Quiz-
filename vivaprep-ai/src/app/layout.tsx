import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://vivaprep.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VivaPrep AI - Smart Study Platform | AI Quiz & Flashcard Generator",
    template: "%s | VivaPrep AI",
  },
  description:
    "Upload your lecture PDFs and instantly generate quizzes, flashcards, viva questions, interview prep, and AI-powered study notes. Trusted by students at MIT, Stanford, and 50+ universities.",
  keywords: [
    "AI study tool",
    "quiz generator",
    "flashcard generator",
    "viva preparation",
    "interview prep AI",
    "lecture notes AI",
    "PDF to quiz",
    "AI flashcards",
    "study platform",
    "exam preparation",
    "AI tutor",
    "smart study",
    "spaced repetition",
    "chat with PDF",
  ],
  authors: [{ name: "VivaPrep AI" }],
  creator: "VivaPrep AI",
  publisher: "VivaPrep AI",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "VivaPrep AI",
    title: "VivaPrep AI - Turn Any Lecture Into a Study Operating System",
    description:
      "Upload a PDF. Get quizzes, flashcards, viva questions, interview prep, and an AI chat — all grounded in your source material.",
    images: [
      {
        url: `${BASE_URL}/icon.svg`,
        width: 512,
        height: 512,
        alt: "VivaPrep AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VivaPrep AI - Smart Study Platform",
    description:
      "Upload a PDF, get AI-generated quizzes, flashcards, viva questions, and more. Study smarter, not harder.",
    images: [`${BASE_URL}/icon.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "cqJo7XnbBnQyzPd7yh_QXGN7Xi38G53sD2bqx7oVjAk",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "VivaPrep AI",
              url: BASE_URL,
              description:
                "AI-powered study platform that turns lecture PDFs into quizzes, flashcards, viva questions, and more.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free plan with 5 PDF uploads",
                },
                {
                  "@type": "Offer",
                  price: "7.99",
                  priceCurrency: "USD",
                  description: "Plus plan for serious students",
                },
              ],
              featureList: [
                "AI Quiz Generator",
                "Smart Flashcards",
                "Viva Preparation",
                "Interview Prep",
                "Chat with PDF",
                "Study Analytics",
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1200",
                bestRating: "5",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What file types can I upload to VivaPrep AI?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "PDF files up to 100MB and 800 pages. Support for PPTX, DOCX, EPUB, TXT, and Markdown is coming soon.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How accurate are the AI-generated questions?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We use advanced AI with RAG grounding — every question is derived from your source material with page citations.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I use VivaPrep AI for any subject?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. VivaPrep AI works with any discipline — from medicine and law to computer science and humanities.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my data secure on VivaPrep AI?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "All uploads are encrypted at rest and in transit. We never share your data with third parties.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
