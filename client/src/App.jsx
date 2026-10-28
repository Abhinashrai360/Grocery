import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import Contact from './pages/Contact';
import Loading from './pages/Loading';
import NotFound from './pages/NotFound';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import FloatingActions from './components/FloatingActions';

const App = () => {
  const { pathname } = useLocation();
  const isSellerPath = pathname.startsWith("/seller");
  const { showUserLogin, isSeller } = useAppContext();

  // every page change starts at the top
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {isSellerPath ? null : <Navbar />}

      {showUserLogin && <Login />}

      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontSize: '14px', borderRadius: '9999px', padding: '10px 18px' },
          success: { iconTheme: { primary: '#4fbf8b', secondary: '#fff' } },
        }}
      />

      <main className={`flex-1 ${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <div key={isSellerPath ? 'seller' : pathname} className={isSellerPath ? '' : 'animate-fade-up'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/loader" element={<Loading />} />
          <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="product-list" element={isSeller ? <ProductList /> : null} />
            <Route path="orders" element={isSeller ? <Orders /> : null} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </main>

      {!isSellerPath && <Footer />}
      {!isSellerPath && <FloatingActions />}
    </div>
  );
};

export default App;
