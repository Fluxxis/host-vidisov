'use client'
import { motion } from 'framer-motion'
import { Play, Shield, Zap, Globe, ChevronRight, Upload } from 'lucide-react'
import Link from 'next/link'

const up = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }
const st = { animate: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">StreamVault</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Link href="/admin" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Admin</Link>
          <Link href="/admin" className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10">Upload Video</Link>
        </motion.div>
      </nav>

      <section className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div variants={st} initial="initial" animate="animate" className="space-y-8">
          <motion.div variants={up} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Platform is live
          </motion.div>
          <motion.h1 variants={up} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
            <span className="gradient-text">Video Hosting</span><br /><span className="text-white">Reimagined</span>
          </motion.h1>
          <motion.p variants={up} className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 leading-relaxed">
            Lightning-fast video delivery with edge-optimized streaming. Upload once, watch everywhere.
          </motion.p>
          <motion.div variants={up} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/admin" className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform">
              Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 glass rounded-full font-semibold hover:bg-white/10 transition-colors">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 rounded-2xl" />
          <div className="glass rounded-2xl p-2 md:p-4">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.05)1px,transparent 1px)',backgroundSize:'20px 20px'}} />
              <motion.div animate={{ scale: [1,1.1,1] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </motion.div>
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why StreamVault?</h2>
          <p className="text-white/50 max-w-xl mx-auto">Built for creators who demand the best.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Edge-optimized global CDN delivery for instant playback anywhere.' },
            { icon: Shield, title: 'Secure by Default', desc: 'Enterprise-grade encryption and access controls for your content.' },
            { icon: Globe, title: 'Global Reach', desc: 'Distributed infrastructure ensures 99.99% uptime worldwide.' },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-8 hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-white/50 max-w-xl mx-auto">Three simple steps to host your video content.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {[
            { step: '01', title: 'Upload', desc: 'Drag and drop your video file to our secure admin panel.' },
            { step: '02', title: 'Process', desc: 'We instantly optimize and distribute your video globally.' },
            { step: '03', title: 'Share', desc: 'Get a shareable link and watch your video anywhere.' },
          ].map((item, i) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center relative">
              <div className="w-24 h-24 mx-auto rounded-2xl glass flex items-center justify-center mb-6 relative z-10">
                <span className="text-3xl font-bold gradient-text">{item.step}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-white/50 max-w-xs mx-auto">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 px-6 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-semibold">StreamVault</span>
          </div>
          <p className="text-white/30 text-sm">Premium video hosting platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
