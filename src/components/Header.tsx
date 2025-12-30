// src/components/Header.tsx
// UPDATED VERSION - Replace your existing Header.tsx with this

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Linkedin, Instagram, Menu, BarChart3, Shield, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'HOME', href: '/', icon: Home },
    { name: 'ALL POSTS', href: '/posts' },
    { name: 'MARKET INTEL', href: '/market-intelligence', icon: BarChart3 },
    { name: 'BUSINESS & TECHNOLOGY', href: '/business-technology' },
    { name: 'PODCAST', href: '/podcast' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://www.linkedin.com/in/catherine-kiriakos', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container-blog">
        <div className="flex items-center justify-center h-20">
          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-1 justify-center" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="nav-link flex items-center space-x-1 whitespace-nowrap"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Social Links & Search - Right Side */}
          <div className="hidden lg:flex items-center space-x-3 ml-auto">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <Button key={label} variant="outline" size="sm" asChild>
                <a href={href} aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              </Button>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              aria-label="Search articles"
              onClick={() => navigate('/search')}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Admin Button */}
            <Button 
              variant="outline" 
              size="sm" 
              aria-label="Admin panel"
              onClick={() => navigate('/admin')}
              title="Admin"
            >
              <Shield className="h-4 w-4" />
            </Button>

            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden absolute right-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="nav-link flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
              <Link
                to="/admin"
                className="nav-link flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                <span>ADMIN</span>
              </Link>
            </nav>
            
            <div className="mt-6 space-y-4">
              <div className="flex space-x-2 items-center">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <Button key={label} variant="outline" size="sm" asChild>
                    <a href={href} aria-label={label}>
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
                
                <ThemeToggle />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                aria-label="Search articles"
                onClick={() => navigate('/search')}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
