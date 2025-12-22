import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6">
        
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kestrel</h3>
            <p className="text-sm">
              Custom-built HVAC AI call agent for HVAC companies. Live in 48 hours.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/calculator" className="hover:text-white">ROI Calculator</Link></li>
              <li><Link href="/demo" className="hover:text-white">Live Demo</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Case Studies</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+15551234567" className="hover:text-white">
                  📞 (555) 123-4567
                </a>
              </li>
              <li>
                <a href="mailto:hello@hvacaiagent.com" className="hover:text-white">
                  ✉️ hello@hvacaiagent.com
                </a>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} HVAC AI Agent. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
