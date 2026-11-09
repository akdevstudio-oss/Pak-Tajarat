import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { addNotification } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const inquiry = [
      'Pak-Tijarat website inquiry',
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Message: ${message.trim()}`
    ].join('\n');

    setWhatsappUrl(`https://wa.me/923261604808?text=${encodeURIComponent(inquiry)}`);
    setSubmitted(true);
    addNotification(
      'WhatsApp Message Ready',
      'Open WhatsApp below to send your inquiry. Your message has not been sent yet.',
      'info'
    );
  };

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="contact-container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Customer Care & Support
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          For product, order, return, or affiliate questions, contact Pak-Tijarat through the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Official Channels</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              For an order-related query, include your order number and a short explanation so the team can review it.
            </p>

            <div className="space-y-4 pt-4">
              <a
                href="https://wa.me/923261604808"
                target="_blank"
                rel="noreferrer"
                className="flex items-start p-4 bg-[#0F9D58]/5 hover:bg-[#0F9D58]/10 border border-[#0F9D58]/15 rounded-2xl transition-all"
              >
                <div className="p-3 bg-[#0F9D58] text-white rounded-xl mr-4 shrink-0"><Phone size={20} /></div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">WhatsApp Support</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Message the support team</p>
                  <p className="text-sm font-black text-[#0F9D58] mt-1">+92 326 1604808</p>
                </div>
              </a>

              <a
                href="mailto:alikhanxada1001@gmail.com"
                className="flex items-start p-4 bg-zinc-50 dark:bg-zinc-950/20 hover:bg-zinc-100/50 border border-gray-100 dark:border-zinc-800/40 rounded-2xl transition-all"
              >
                <div className="p-3 bg-zinc-800 dark:bg-zinc-800 text-white rounded-xl mr-4 shrink-0"><Mail size={20} /></div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Email Support</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Send a support email</p>
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-1 break-all">alikhanxada1001@gmail.com</p>
                </div>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 text-left">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Returns & Delivery</span>
            <p className="text-xs text-gray-500 mt-1">
              Courier options and delivery estimates depend on the destination. Return requests should be raised within 7 days of delivery with the reason for return.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 text-left">Prepare a WhatsApp Inquiry</h2>
          <p className="text-xs text-gray-500 mb-6 text-left">
            Complete the details below. We will prepare a message for WhatsApp; you must open WhatsApp and press Send to submit it.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-4 bg-green-50 dark:bg-green-950/25 text-[#0F9D58] rounded-full">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Your Message Is Ready</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                WhatsApp has not received your inquiry yet. Open the prepared message and press Send to contact support.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-sm font-extrabold px-6 py-3 rounded-xl transition-colors"
              >
                <Phone size={16} />
                Open WhatsApp to Send
              </a>
              <div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#0F9D58] hover:text-[#0B7B44] text-xs font-bold underline cursor-pointer mt-2"
                >
                  Edit inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/25 border border-gray-100 dark:border-zinc-850 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/25 border border-gray-100 dark:border-zinc-850 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Inquiry / Message</label>
                <textarea
                  required
                  maxLength={2000}
                  rows={6}
                  placeholder="Include your order number if your question is about an order."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/25 border border-gray-100 dark:border-zinc-850 rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send size={16} />
                <span>Prepare WhatsApp Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
