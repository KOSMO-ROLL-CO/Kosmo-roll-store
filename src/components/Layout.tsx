import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ExperienceLayer from './ExperienceLayer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ExperienceLayer />
      <Header />
      <main className="flex-1 pt-20 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
