import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2><span>Eco</span>Shop</h2>
                    <p>
                        Your trusted destination for sustainable, high-quality products. We offer
                        curated items built with care for you and the planet.
                    </p>
                </div>

                <div className="footer-col">
                    <h3>Explore</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Shop Catalog</Link></li>
                        <li><Link to="/wishlist">Wishlist</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>Customer Care</h3>
                    <ul className="footer-links">
                        <li><a href="#shipping">Shipping & Returns</a></li>
                        <li><a href="#sustainability">Sustainability</a></li>
                        <li><a href="#faq">FAQs</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>Newsletter</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        Subscribe for latest updates, new arrivals & exclusive offers.
                    </p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email" required />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} EcoShop. All rights reserved.</p>
                <div className="social-icons">
                    <span className="social-icon-btn" title="Instagram">🌿</span>
                    <span className="social-icon-btn" title="Pinterest">📌</span>
                    <span className="social-icon-btn" title="Facebook">✨</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
