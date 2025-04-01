import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TimerIcon, HammerIcon, UserIcon, ShieldCheckIcon } from "lucide-react";

export default function HomePage() {
  return (<>
    <Navbar/>
    <div className="min-h-screen bg-emerald-100">
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-[60vh] flex flex-col justify-center items-center text-white text-center px-4 bg-gradient-to-b from-emerald-700 to-emerald-500 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Bid, Win & Own Unique Items</h1>
        <p className="text-lg mb-6">Join live auctions and get the best deals.</p>
        <div className="flex gap-4">
          <Button className="bg-emerald-800 hover:bg-emerald-900">Start Bidding</Button>
          <Button variant="outline" className="text-emerald-600 border-white hover:bg-gray-300 hover:text-emerald-800">Sell an Item</Button>
        </div>
      </div>
      
      {/* Live Auctions */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6">Live Auctions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((auction) => (
            <Card key={auction} className="p-4 bg-white shadow-md border border-emerald-300">
              <img src="/sample-auction.jpg" alt="Auction Item" className="rounded-md mb-4" />
              <h3 className="text-lg font-semibold text-emerald-800">Rare Collectible Watch</h3>
              <p className="text-gray-600">Current Bid: <span className="font-bold">₹15,000</span></p>
              <div className="flex items-center gap-2 mt-3">
                <TimerIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Ends in: 2h 30m</span>
              </div>
              <Button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">Place Bid</Button>
            </Card>
          ))}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="bg-white py-12 px-6 text-center">
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <UserIcon className="text-emerald-600" />, title: "Sign Up", desc: "Create your free account to start bidding." },
            { icon: <HammerIcon className="text-emerald-600" />, title: "Place Bids", desc: "Join live auctions and place competitive bids." },
            { icon: <ShieldCheckIcon className="text-emerald-600" />, title: "Win & Secure", desc: "Secure payments and trusted transactions." },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="p-4 bg-emerald-200 rounded-full mb-3">{step.icon}</div>
              <h3 className="text-lg font-semibold text-emerald-800">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-emerald-700 text-white text-center py-12 px-6">
        <h2 className="text-2xl font-semibold mb-4">Want to Sell Your Items?</h2>
        <p className="mb-6">List your items and start earning today!</p>
        <Button className="bg-white text-emerald-700 hover:bg-gray-200">Start Selling</Button>
      </section>
    </div>
  </>
  );
}
