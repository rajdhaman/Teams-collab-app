import { Zap } from "lucide-react";

export function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <Zap className="h-6 w-6 text-white m-1" />
                </div>
                <span className="text-white font-bold">CollabEdge</span>
              </div>
              <p className="text-sm">Team collaboration made simple.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="text-white font-semibold mb-4">{col.title}</h3>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm">
              © 2025 CollabEdge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
