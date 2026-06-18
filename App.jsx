import { useState, useEffect, createContext, useContext, useReducer } from "react";

// ─── CONTEXT ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const CartContext = createContext(null);

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const USERS_DB = [
  { id: 1, name: "Admin User", email: "admin@shop.com", password: "admin123", role: "admin" },
  { id: 2, name: "John Doe",   email: "user@shop.com",  password: "user123",  role: "user"  },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: "Wireless Headphones", price: 2499, category: "Electronics", stock: 15, image: "🎧", description: "Premium noise-cancelling headphones with 30hr battery." },
  { id: 2, name: "Running Shoes",       price: 1899, category: "Footwear",    stock: 8,  image: "👟", description: "Lightweight shoes with air-cushion sole for comfort." },
  { id: 3, name: "Leather Backpack",    price: 3299, category: "Bags",        stock: 5,  image: "🎒", description: "Genuine leather backpack with laptop compartment." },
  { id: 4, name: "Smart Watch",         price: 4999, category: "Electronics", stock: 12, image: "⌚", description: "Track fitness, notifications & calls on the go." },
  { id: 5, name: "Coffee Maker",        price: 1599, category: "Kitchen",     stock: 20, image: "☕", description: "Brew perfect espresso every morning." },
  { id: 6, name: "Yoga Mat",            price: 799,  category: "Sports",      stock: 30, image: "🧘", description: "Non-slip, eco-friendly 6mm thick yoga mat." },
  { id: 7, name: "Sunglasses",          price: 1299, category: "Fashion",     stock: 0,  image: "🕶️", description: "UV400 polarised lens with titanium frame." },
  { id: 8, name: "Bluetooth Speaker",   price: 1999, category: "Electronics", stock: 10, image: "🔊", description: "360° surround sound, waterproof, 20hr battery." },
];

// ─── CART REDUCER ──────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find(i => i.id === action.product.id);
      if (exists) return state.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "UPDATE_QTY": return state.map(i => i.id === action.id ? { ...i, qty: action.qty } : i);
    case "CLEAR": return [];
    default: return state;
  }
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f5f6fa; color: #1a1a2e; }
  :root {
    --primary: #2563eb; --primary-dark: #1d4ed8; --secondary: #7c3aed;
    --success: #16a34a; --danger: #dc2626; --warning: #d97706;
    --bg: #f5f6fa; --card: #ffffff; --border: #e5e7eb;
    --text: #1a1a2e; --muted: #6b7280;
    --shadow: 0 2px 12px rgba(0,0,0,0.08); --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
  }
  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav { background: var(--card); border-bottom: 1px solid var(--border); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 60px; position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow); }
  .nav-brand { font-size: 20px; font-weight: 700; color: var(--primary); letter-spacing: -0.5px; }
  .nav-brand span { color: var(--secondary); }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab { padding: 6px 14px; border-radius: 8px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--muted); transition: all .15s; }
  .nav-tab:hover { background: #f3f4f6; color: var(--text); }
  .nav-tab.active { background: var(--primary); color: #fff; }
  .badge { background: var(--danger); color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: -6px; margin-top: -12px; }

  /* BUTTONS */
  .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-primary:hover { background: var(--primary-dark); }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-success { background: var(--success); color: #fff; }
  .btn-success:hover { background: #15803d; }
  .btn-outline { background: transparent; border: 1.5px solid var(--primary); color: var(--primary); }
  .btn-outline:hover { background: var(--primary); color: #fff; }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }

  /* CARD */
  .card { background: var(--card); border-radius: 14px; box-shadow: var(--shadow); }

  /* PAGE */
  .page { flex: 1; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; }
  .page-title { font-size: 22px; font-weight: 700; margin-bottom: 20px; }

  /* LOGIN */
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); }
  .login-card { background: #fff; border-radius: 20px; padding: 36px; width: 360px; box-shadow: var(--shadow-lg); }
  .login-logo { font-size: 28px; font-weight: 800; color: var(--primary); text-align: center; margin-bottom: 6px; }
  .login-sub { text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 28px; }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 13px; font-weight: 600; color: var(--text); display: block; margin-bottom: 6px; }
  .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; transition: border .15s; }
  .form-input:focus { border-color: var(--primary); }
  .form-input.error { border-color: var(--danger); }
  .err-msg { color: var(--danger); font-size: 12px; margin-top: 4px; }
  .login-hint { background: #eff6ff; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: var(--muted); margin-top: 12px; line-height: 1.6; }
  .login-hint b { color: var(--primary); }

  /* PRODUCTS */
  .filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
  .search-input { padding: 9px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; width: 200px; }
  .search-input:focus { border-color: var(--primary); }
  .filter-btn { padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted); transition: all .15s; }
  .filter-btn.active { border-color: var(--primary); background: var(--primary); color: #fff; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
  .product-card { background: var(--card); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow); transition: transform .2s, box-shadow .2s; }
  .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .product-img { font-size: 56px; text-align: center; padding: 24px 0; background: linear-gradient(135deg, #eff6ff, #f5f3ff); }
  .product-body { padding: 14px; }
  .product-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .product-desc { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 10px; }
  .product-footer { display: flex; align-items: center; justify-content: space-between; }
  .product-price { font-size: 17px; font-weight: 800; color: var(--primary); }
  .product-price span { font-size: 11px; font-weight: 500; color: var(--muted); }
  .out-badge { font-size: 11px; background: #fee2e2; color: var(--danger); padding: 3px 8px; border-radius: 20px; font-weight: 600; }
  .in-badge  { font-size: 11px; background: #dcfce7; color: var(--success); padding: 3px 8px; border-radius: 20px; font-weight: 600; }

  /* CART */
  .cart-empty { text-align: center; padding: 60px 0; color: var(--muted); }
  .cart-empty-icon { font-size: 64px; margin-bottom: 12px; }
  .cart-item { display: flex; align-items: center; gap: 14px; padding: 14px; border-bottom: 1px solid var(--border); }
  .cart-item-img { font-size: 36px; background: #eff6ff; border-radius: 10px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cart-item-name { font-weight: 600; font-size: 14px; }
  .cart-item-price { color: var(--primary); font-weight: 700; font-size: 14px; }
  .qty-ctrl { display: flex; align-items: center; gap: 8px; }
  .qty-btn { width: 28px; height: 28px; border-radius: 6px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
  .cart-summary { padding: 18px; }
  .cart-total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .cart-total-row.bold { font-weight: 700; font-size: 16px; border-top: 1.5px solid var(--border); margin-top: 8px; padding-top: 12px; }

  /* ORDERS */
  .order-card { padding: 16px; border-bottom: 1px solid var(--border); }
  .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .order-id { font-weight: 700; font-size: 14px; }
  .order-status { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .status-pending   { background: #fef3c7; color: var(--warning); }
  .status-shipped   { background: #dbeafe; color: var(--primary); }
  .status-delivered { background: #dcfce7; color: var(--success); }
  .status-cancelled { background: #fee2e2; color: var(--danger); }
  .order-items { font-size: 13px; color: var(--muted); }
  .order-meta { display: flex; gap: 16px; font-size: 12px; color: var(--muted); margin-top: 6px; }

  /* ADMIN */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--card); border-radius: 14px; padding: 18px; box-shadow: var(--shadow); }
  .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; }
  .stat-value { font-size: 26px; font-weight: 800; margin-top: 4px; }
  .stat-blue   { color: var(--primary); }
  .stat-green  { color: var(--success); }
  .stat-purple { color: var(--secondary); }
  .stat-red    { color: var(--danger); }
  .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .admin-table th { text-align: left; padding: 10px 12px; background: #f9fafb; font-weight: 600; color: var(--muted); border-bottom: 1.5px solid var(--border); }
  .admin-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .admin-table tr:hover td { background: #f9fafb; }
  .admin-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
  .admin-tab { padding: 8px 18px; border-radius: 8px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; }
  .admin-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  .product-emoji-input { width: 60px; font-size: 20px; text-align: center; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
  .modal { background: #fff; border-radius: 16px; padding: 28px; width: 420px; max-width: 95vw; box-shadow: var(--shadow-lg); }
  .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 18px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

  /* TOAST */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 300; display: flex; flex-direction: column; gap: 8px; }
  .toast { background: var(--text); color: #fff; padding: 12px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; animation: slideIn .3s ease; }
  @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: none; opacity: 1; } }
  .toast.success { background: var(--success); }
  .toast.error   { background: var(--danger); }

  /* SELECT */
  .form-select { width: 100%; padding: 9px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; background: #fff; }
  .form-select:focus { border-color: var(--primary); }

  /* CHECKOUT */
  .checkout-steps { display: flex; gap: 0; margin-bottom: 28px; }
  .step { flex: 1; text-align: center; padding: 10px; font-size: 13px; font-weight: 600; border-bottom: 3px solid var(--border); color: var(--muted); }
  .step.active { border-color: var(--primary); color: var(--primary); }
  .step.done   { border-color: var(--success); color: var(--success); }
  .success-anim { text-align: center; padding: 32px 0; }
  .success-icon { font-size: 72px; margin-bottom: 12px; }

  @media (max-width: 600px) {
    .nav { padding: 0 12px; }
    .page { padding: 16px; }
    .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .nav-tabs { gap: 2px; }
    .nav-tab { padding: 5px 9px; font-size: 12px; }
  }
`;

// ─── TOAST ─────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");

  const submit = () => {
    const user = USERS_DB.find(u => u.email === email && u.password === pass);
    if (!user) { setErr("Invalid email or password."); return; }
    onLogin(user);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">🛒 ShopEase</div>
        <div className="login-sub">E-Commerce Web Application</div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className={`form-input ${err ? "error" : ""}`} type="email" placeholder="you@example.com"
            value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className={`form-input ${err ? "error" : ""}`} type="password" placeholder="••••••••"
            value={pass} onChange={e => { setPass(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && submit()} />
          {err && <div className="err-msg">{err}</div>}
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={submit}>
          Sign In →
        </button>
        <div className="login-hint">
          <b>Admin:</b> admin@shop.com / admin123<br/>
          <b>User:</b> user@shop.com / user123
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ───────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, isAdmin, onEdit, onDelete }) {
  const outOfStock = product.stock === 0;
  return (
    <div className="product-card">
      <div className="product-img">{product.image}</div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-desc">{product.description}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
          {product.category} · Stock: {product.stock}
        </div>
        <div className="product-footer">
          <div>
            <div className="product-price">₹{product.price.toLocaleString("en-IN")}</div>
          </div>
          {isAdmin ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-outline btn-sm" onClick={() => onEdit(product)}>✏️</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>🗑️</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" disabled={outOfStock} onClick={() => !outOfStock && onAdd(product)}>
              {outOfStock ? <span className="out-badge">Out</span> : "Add +"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CATALOG ────────────────────────────────────────────────────────
function CatalogPage({ products, cart, dispatch, toast, isAdmin, setProducts }) {
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("All");
  const [editProduct, setEdit] = useState(null);
  const [showAdd, setShowAdd]  = useState(false);

  const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchCat = cat === "All" || p.category === cat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    dispatch({ type: "ADD", product });
    toast(`${product.name} added to cart!`, "success");
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast("Product deleted.", "error");
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="page-title">🛍️ Products</div>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>}
      </div>
      <div className="filters">
        <input className="search-input" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)} />
        {cats.map(c => (
          <button key={c} className={`filter-btn ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="products-grid">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} isAdmin={isAdmin}
            onEdit={setEdit} onDelete={deleteProduct} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            😕 No products found.
          </div>
        )}
      </div>
      {(editProduct || showAdd) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setEdit(null); setShowAdd(false); }}
          onSave={(p) => {
            if (editProduct) {
              setProducts(prev => prev.map(x => x.id === p.id ? p : x));
              toast("Product updated!", "success");
            } else {
              setProducts(prev => [...prev, { ...p, id: Date.now() }]);
              toast("Product added!", "success");
            }
            setEdit(null); setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

// ─── PRODUCT MODAL ──────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: "", price: "", category: "", stock: "", image: "📦", description: "" });
  const set = (k, v) => setForm
