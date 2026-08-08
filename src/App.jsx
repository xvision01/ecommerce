import { useMemo, useState } from 'react';

const products = [
  { id: 1, name: 'Minimal Sneakers', category: 'Shoes', price: 79, rating: 4.8, emoji: '👟' },
  { id: 2, name: 'Everyday Backpack', category: 'Bags', price: 64, rating: 4.7, emoji: '🎒' },
  { id: 3, name: 'Classic Watch', category: 'Accessories', price: 129, rating: 4.9, emoji: '⌚' },
  { id: 4, name: 'Essential Hoodie', category: 'Clothing', price: 58, rating: 4.6, emoji: '🧥' },
  { id: 5, name: 'Wireless Headphones', category: 'Electronics', price: 149, rating: 4.8, emoji: '🎧' },
  { id: 6, name: 'Ceramic Bottle', category: 'Lifestyle', price: 32, rating: 4.5, emoji: '🧴' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const categories = ['All', ...new Set(products.map((product) => product.category))];

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const addToCart = (product) => setCart((items) => [...items, product]);

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#">SHOPLY</a>
        <nav>
          <a href="#products">Shop</a>
          <a href="#featured">Featured</a>
          <a href="#about">About</a>
        </nav>
        <button className="cart" aria-label="Shopping cart">Cart ({cart.length})</button>
      </header>

      <main>
        <section className="hero" id="featured">
          <div>
            <p className="eyebrow">NEW SEASON · 2026</p>
            <h1>Good products.<br /><span>Simple shopping.</span></h1>
            <p className="hero-copy">Discover everyday essentials selected for quality, design, and value.</p>
            <a className="primary" href="#products">Shop the collection</a>
          </div>
          <div className="hero-art" aria-hidden="true">✦</div>
        </section>

        <section className="catalog" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>Shop products</h2>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </div>

          <div className="filters">
            {categories.map((item) => (
              <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredProducts.map((product) => (
              <article className="card" key={product.id}>
                <div className="product-image">{product.emoji}</div>
                <div className="product-info">
                  <p className="category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <div className="product-bottom">
                    <strong>${product.price}</strong>
                    <span>★ {product.rating}</span>
                  </div>
                  <button className="add" onClick={() => addToCart(product)}>Add to cart</button>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && <p className="empty">No products match your search.</p>}
        </section>

        <section className="about" id="about">
          <p className="eyebrow">WHY SHOPLY</p>
          <h2>Designed for a better<br />online shopping experience.</h2>
          <div className="values">
            <div><strong>01</strong><p>Curated products</p></div>
            <div><strong>02</strong><p>Simple checkout</p></div>
            <div><strong>03</strong><p>Fast, reliable delivery</p></div>
          </div>
        </section>
      </main>

      <footer><span>SHOPLY</span><span>Built with React · Ecommerce project</span></footer>
    </div>
  );
}
