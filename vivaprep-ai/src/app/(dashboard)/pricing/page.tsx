"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    id: "basic",
    name: "Basic",
    icon: Zap,
    description: "Perfect for getting started with AI-powered studying",
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    buttonVariant: "outline" as const,
    buttonLabel: "Current Plan",
    popular: false,
    features: [
      { text: "Upload up to 5 PDFs", included: true },
      { text: "1 quiz generation per day", included: true },
      { text: "2 flashcard sets per day", included: true },
      { text: "Basic note summaries", included: true },
      { text: "Community support", included: true },
      { text: "Viva & interview prep", included: false },
      { text: "Priority AI processing", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Export to PDF/Word", included: false },
      { text: "Team collaboration", included: false },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    icon: Sparkles,
    description: "For serious students who want to ace every exam",
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    color: "text-violet-600",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    borderColor: "border-violet-400 dark:border-violet-600",
    buttonVariant: "gradient" as const,
    buttonLabel: "Upgrade to Plus",
    popular: true,
    features: [
      { text: "Upload up to 50 PDFs", included: true },
      { text: "Unlimited quiz generations", included: true },
      { text: "Unlimited flashcard sets", included: true },
      { text: "All note styles (Concise, Detailed, Exam, Presentation)", included: true },
      { text: "Viva & interview prep", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Basic analytics", included: true },
      { text: "Email support", included: true },
      { text: "Export to PDF/Word", included: false },
      { text: "Team collaboration", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    description: "Ultimate plan for power users and study groups",
    monthlyPrice: 19.99,
    yearlyPrice: 15.99,
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    buttonVariant: "outline" as const,
    buttonLabel: "Upgrade to Pro",
    popular: false,
    features: [
      { text: "Unlimited PDF uploads", included: true },
      { text: "Unlimited quiz generations", included: true },
      { text: "Unlimited flashcard sets", included: true },
      { text: "All note styles + custom prompts", included: true },
      { text: "Viva & interview prep", included: true },
      { text: "Fastest AI processing", included: true },
      { text: "Advanced analytics & insights", included: true },
      { text: "Export to PDF/Word/Anki", included: true },
      { text: "Team collaboration (up to 10)", included: true },
      { text: "Priority 24/7 support", included: true },
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Unlock the full power of AI-assisted studying
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm font-medium cursor-pointer transition-colors",
            billing === "monthly" ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </span>
        <button
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            billing === "yearly"
              ? "bg-violet-600"
              : "bg-muted-foreground/30"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
              billing === "yearly" ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <span
          className={cn(
            "text-sm font-medium cursor-pointer transition-colors",
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => setBilling("yearly")}
        >
          Yearly
        </span>
        {billing === "yearly" && (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
            Save 20%
          </Badge>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={cn(
                  "relative h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
                  plan.popular && "border-2 border-violet-500 dark:border-violet-400 shadow-lg shadow-violet-500/10"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 text-xs font-semibold shadow-md">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", plan.bg)}>
                      <plan.icon className={cn("h-5 w-5", plan.color)} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{plan.name}</h2>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-5">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        ${price === 0 ? "0" : price.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        /mo
                      </span>
                    </div>
                    {billing === "yearly" && price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(price * 12).toFixed(2)} billed yearly
                      </p>
                    )}
                    {price === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Free forever
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.buttonVariant}
                    className={cn(
                      "w-full mb-6",
                      plan.id === "basic" && "cursor-default opacity-70"
                    )}
                    disabled={plan.id === "basic"}
                  >
                    {plan.buttonLabel}
                  </Button>

                  {/* Feature List */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      What&apos;s included
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <Check className={cn("h-4 w-4 mt-0.5 shrink-0", plan.color)} />
                          ) : (
                            <X className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/40" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              feature.included ? "text-foreground" : "text-muted-foreground/50"
                            )}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ / Bottom Note */}
      <div className="text-center pb-8">
        <p className="text-sm text-muted-foreground">
          All plans include access to our AI study assistant. Upgrade or downgrade at any time.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Prices in USD. Yearly plans billed annually.
        </p>
      </div>
    </div>
  );
}
