import React from 'react';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const tiers = [
    {
      name: "Starter",
      price: "0",
      description: "Perfect for individuals and small teams getting started.",
      features: ["Up to 3 Projects", "5 Team Members", "Basic Kanban Board", "Nexus AI (30 Days Free)", "Activity Logs (30 Days Free)"],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "19",
      description: "Advanced features for growing teams needing more power.",
      features: ["Unlimited Projects", "Unlimited Members", "Nexus AI Analyst", "Advanced Activity Trailing", "Priority Support"],
      buttonText: "Coming Soon",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Dedicated support and infrastructure for large scale orgs.",
      features: ["Everything in Pro", "SSO & Advanced Security", "Custom Integrations", "Dedicated Server Option"],
      buttonText: "Coming Soon",
      popular: false
    }
  ];

  return (
    <section className="py-24 px-6 bg-stone-50 dark:bg-[#0c0c0e] w-full border-t border-stone-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-stone-900 dark:text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-stone-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Scale your team without hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 sm:gap-8 max-w-6xl mx-auto items-center">
          {tiers.map((tier, idx) => (
            <div key={idx} className={`relative p-8 rounded-3xl transition-all duration-300 ${tier.popular ? 'bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl'}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold tracking-widest uppercase shadow-md">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className={`text-sm mb-6 ${tier.popular ? 'text-indigo-100' : 'text-stone-500 dark:text-slate-400'}`}>{tier.description}</p>
              
              <div className="mb-8">
                {tier.price === 'Custom' ? (
                  <span className="text-4xl font-black">Custom</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">${tier.price}</span>
                    <span className={`font-medium ${tier.popular ? 'text-indigo-100' : 'text-stone-500 dark:text-slate-400'}`}>/mo</span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${tier.popular ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                      <Check className={`w-4 h-4 ${tier.popular ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    </div>
                    <span className="font-semibold">{feat}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition-all ${tier.popular ? 'bg-white text-indigo-600 hover:bg-stone-50 hover:shadow-lg' : 'bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-white hover:bg-stone-200 dark:hover:bg-slate-700'}`}>
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
