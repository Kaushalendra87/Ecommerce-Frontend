import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            {/* HERO SECTION */}
            <section className="hero-banner">
                <span className="hero-tag">ECOSHOP SUSTAINABLE COLLECTION</span>
                <h1 className="hero-title">Find Calm in Every Detail</h1>
                <p className="hero-subtitle">
                    Welcome to EcoShop. Discover a curated collection of eco-friendly, sustainable products
                    crafted to bring quality, harmony, and simplicity to your everyday life.
                </p>
                <div className="hero-buttons">
                    <Link to="/products" className="btn-sage">
                        Shop Now
                    </Link>
                    <Link to="/products" className="btn-outline-beige">
                        Explore Collection
                    </Link>
                </div>
            </section>

            {/* FEATURES HIGHLIGHT SECTION */}
            <section className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">🌿</div>
                    <h3 className="feature-title">Sustainable Materials</h3>
                    <p className="feature-desc">
                        Ethically sourced, eco-friendly materials engineered for longevity and style.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🔄</div>
                    <h3 className="feature-title">Free Returns</h3>
                    <p className="feature-desc">
                        Enjoy 30-day hassle-free returns and quick exchanges on all orders.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">💬</div>
                    <h3 className="feature-title">Customer Care</h3>
                    <p className="feature-desc">
                        Dedicated support team available 24/7 for a smooth shopping experience.
                    </p>
                </div>
            </section>

            {/* PROMO / BANNER SECTION */}
            <section className="page-container" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", marginBottom: "0.75rem" }}>
                    Quality Products for Sustainable Living
                </h2>
                <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 1.5rem auto" }}>
                    Explore our online catalog at EcoShop for exclusive deals and premium items.
                </p>
                <Link to="/products" className="btn-sage" style={{ display: "inline-block" }}>
                    Browse Catalog
                </Link>
            </section>
        </div>
    );
}

export default Home;