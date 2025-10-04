import { BotMessageSquare, Home, LibraryBig, Menu, Network, Rocket } from 'lucide-react';
import { useState } from 'react'
import { NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';

const NavBar = () => {

  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/publications', label: 'Publications', icon: LibraryBig },
    { to: '/ask-gards', label: 'Ask GARDS', icon: BotMessageSquare },
  ];

  const NavContent = () => (
    <>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition-smooth hover:bg-secondary ${
              isActive
                ? 'bg-primary text-primary-foreground font-medium mx-2'
                : 'text-foreground hover:text-primary mx-2'
            }`
          }
          onClick={() => setIsOpen(false)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <nav className="flex h-16 w-full items-center justify-between px-6">
    {/* Logo */}
    <div className="flex items-center gap-2">
      <Rocket className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold text-primary">
        NASA Bioscience
      </span>
    </div>

    {/* Desktop Navigation */}
    <div className="hidden md:flex items-center gap-4">
      <NavContent />
      <ModeToggle />
    </div>

    {/* Mobile Navigation */}
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-2 mb-6 ml-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">
              NASA Bioscience
            </span>
          </div>
          <NavContent />
          <div className="ml-2 mt-2">
            <ModeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </nav>
</header>

  )
}

export default NavBar