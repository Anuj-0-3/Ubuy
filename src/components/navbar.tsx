'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Menu, X } from "lucide-react";
import { motion } from 'framer-motion';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="p-6 shadow-md bg-emerald-600 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          <h1 className='text-3xl font-bold text-slate-100 font-sans'>U-Buy</h1>
        </Link>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
              <Link href="/auctions" className="hover:text-slate-100">Auctions</Link>
              <Link href="/create-auction" className="hover:text-slate-100">Create Auction</Link>
              <Link href="/bidded-auctions" className="hover:text-slate-100">Bidded Auctions</Link>
              <Link href="/profile" className="hover:text-slate-100">Profile</Link>
              <Button onClick={() => signOut()} className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                <Button className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Login</Button>
              </Link>
              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                <Button className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Sign-Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          className="md:hidden flex flex-col items-center space-y-4 mt-4"
          initial={{ opacity: 0, y: -20 }} // start from an invisible position
          animate={{ opacity: 1, y: 0 }}    // animate to visible position
          transition={{ duration: 0.3 }}    // 0.3s duration for the animation
        >
          {session ? (
            <>
              <Link href="/auctions" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Auctions</Link>
              <Link href="/create-auction" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Create Auction</Link>
              <Link href="/my-auction" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>My Auctions</Link>
              <Link href="/profile" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Profile</Link>
              <Button onClick={() => { signOut(); setIsOpen(false); }} className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                <Button className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Login</Button>
              </Link>
              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                <Button className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Sign-Up</Button>
              </Link>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;

