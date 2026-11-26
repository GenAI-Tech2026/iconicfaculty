"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ParticleText from '../components/ParticleText';
import PixelIndiaMap from '../components/PixelIndiaMap';

export default function Home() {
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');

          const delay = entry.target.style.getPropertyValue('--delay');
          if (delay) {
            entry.target.style.transitionDelay = delay;
          }

          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
      observer.observe(el);
    });

    // Update active navbar pill based on scroll position
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'about') setActiveNav('about');
            else if (entry.target.id === 'featured-videos') setActiveNav('talks');
            else if (entry.target.id === 'resources') setActiveNav('resources');
          }
        });
      },
      { threshold: 0.35 },
    );

    ['about', 'featured-videos', 'resources'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    const onScrollTop = () => {
      if (window.scrollY < 260) setActiveNav('home');
    };
    window.addEventListener('scroll', onScrollTop, { passive: true });

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScrollTop);
    };
  }, []);

  return (
    <>
      <nav className="pill-navbar">
        <div className="nav-links">
          <a href="#" onClick={() => setActiveNav('home')} className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}>HOME</a>
          <a href="#about" onClick={() => setActiveNav('about')} className={`nav-link ${activeNav === 'about' ? 'active' : ''}`}>ABOUT</a>
          <a href="#featured-videos" onClick={() => setActiveNav('talks')} className={`nav-link ${activeNav === 'talks' ? 'active' : ''}`}>TALKS</a>
          <Link href="/links" onClick={() => setActiveNav('resources')} className={`nav-link ${activeNav === 'resources' ? 'active' : ''}`}>RESOURCES</Link>
          <a href="https://www.youtube.com/@TheIconicFaculty" target="_blank" rel="noreferrer" className="nav-link">SUBSCRIBE</a>
        </div>
      </nav>

      <main>
        <section className="hero-new">
          <h1 className="sr-only">Iconic Faculty — Free Education for Intermediate Students</h1>
          <ParticleText text={"ICONIC\nFACULTY"} />
          

          <div className="hero-content-new">
            <h2 className="hero-headline reveal-up" style={{ '--delay': '0.4s' }}>
              Education is a right, not a business.
            </h2>
            <div className="hero-actions-new reveal-up" style={{ '--delay': '0.6s' }}>
              <a href="https://www.youtube.com/@TheIconicFaculty" target="_blank" rel="noreferrer" className="btn btn-primary pulse-btn">
                Join the Revolution
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container reveal-up">
            <div className="about-grid">
              <div className="about-text">
                <h2 className="section-title">The <span className="highlight">Truth</span> About College Mafias</h2>
                <p>For over a decade and a half, I have witnessed the education system being turned into a profit-making machine. Intermediate students and their parents are constantly pressured, looted, and misled by powerful college mafias.</p>
                <p><strong>This ends here.</strong></p>
                <p>I have retired from that corrupt system to bring you what you truly deserve: genuine, high-quality, and absolutely free educational resources. Knowledge shouldn't come with a premium price tag.</p>
              </div>
              <div className="about-stats glass-panel">
                <div className="stat-item">
                  <div className="stat-number">15</div>
                  <div className="stat-label">Years of Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Rupees Cost</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Commitment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="featured-videos" className="featured-section">
          <div className="container">
            <div className="featured-header reveal-up">
              <span className="section-label">TALKS</span>
              <h2 className="section-title">Shaping the conversation,<br/>one stage at a time.</h2>
              <p className="section-description">
                I don't just teach, I love to share. From the keynote stages to the lecture halls of India's leading IITs and Universities, I've been invited to speak on the future of education. My goal is always the same: to turn complex concepts into actionable insights for students everywhere.
              </p>
            </div>
          </div>
          
          <div className="videos-track-container reveal-right" style={{ '--delay': '0.4s' }}>
            <div className="videos-track">
              {[
                { id: "HlE4Xq4rw_4", title: "Cheat Codes Revealed", subtitle: "EAMCET 2026" },
                { id: "IhCK9pAgDns", title: "Cheat Codes for EAMCET", subtitle: "TS/AP EAMCET 2026" },
                { id: "8Kckm53RoAk", title: "50 Marks Strategy", subtitle: "EAMCET PHYSICS" },
                { id: "rL-DxQMjxi8", title: "EAMCET Cheat Codes", subtitle: "TS & AP EAMCET 2026" },
                { id: "8CTfA0DaQYs", title: "Rank Predictor", subtitle: "AP & TS EAMCET" },
                { id: "QMaKeMfOdFE", title: "Last 10 Days Plan", subtitle: "SCORE 60+ MARKS" },
                { id: "tTovvCcVLG8", title: "75+ Marks Strategy", subtitle: "AP EAMCET" },
                { id: "8xPZ4F8FLTE", title: "Exam Hall Tips", subtitle: "DOCUMENTS REQUIRED" },
                { id: "JhQY1_2H8_k", title: "20 Days Plan", subtitle: "SCORE 80+ MARKS" },
                { id: "-BxEi28GXxQ", title: "Last 5 Days Plan", subtitle: "TG & AP EAMCET" },
                { id: "1p1xUWuVijU", title: "Exam Hall Strategy", subtitle: "EXAM HALL TRICKS" }
              ].map((video, index) => (
                <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" key={video.id} className="video-card-v2">
                  <div className="video-bg" style={{ backgroundImage: `url(https://img.youtube.com/vi/${video.id}/maxresdefault.jpg), url(https://img.youtube.com/vi/${video.id}/hqdefault.jpg)` }}></div>
                  <div className="video-overlay">
                    <div className="video-badge">{(index + 1).toString().padStart(2, '0')}</div>
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.subtitle}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="about-section" style={{ textAlign: 'center', padding: '6rem 5%' }}>
          <div className="container reveal-up">
            <h2 className="section-title">Free Study <span className="highlight">Resources</span></h2>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '1rem', maxWidth: '580px', marginInline: 'auto' }}>
              Access all our official channels, lecture playlists, and free downloadable PDF study materials in one place.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/links" className="btn btn-primary">
                Open Links &amp; Free PDFs &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bento-footer">
        <div className="bento-grid">
          {/* Main Block */}
          <div className="bento-card bento-main">
            <div className="bento-label">TEACHING</div>
            <div className="bento-main-content">
              <h2>Let's make<br/>education <span className="highlight-text">free.</span></h2>
              <a href="mailto:contact@iconicfaculty.com" className="bento-email">contact@iconicfaculty.com</a>
            </div>
            <div className="bento-glow"></div>
          </div>
          
          {/* Location Block */}
          <div className="bento-card bento-location">
            <div className="bento-label">CURRENTLY</div>
            <p className="location-text">based out of <span className="highlight-text">Hyderabad</span></p>
            <div className="map-container">
              <PixelIndiaMap />
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="bento-col">
            <div className="bento-card bento-book">
              <div className="bento-label">LEARN</div>
              <a href="https://www.youtube.com/@TheIconicFaculty" target="_blank" rel="noreferrer" className="bento-link-large">
                Watch on YouTube &rarr;
              </a>
            </div>
            <div className="bento-card bento-pages">
              <div className="bento-label">PAGES</div>
              <ul className="bento-links">
                <li><Link href="/">Home</Link></li>
                <li><a href="#about">About</a></li>
                <li><a href="#featured-videos">Talks</a></li>
                <li><Link href="/links">Resources &amp; PDFs</Link></li>
                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bento-footer-bottom">
          <div className="bento-socials">
            <span className="bento-social-label">FIND ME</span>
            <a href="https://www.instagram.com/the_iconic_faculty" target="_blank" rel="noreferrer">INSTAGRAM</a>
            <span className="separator">/</span>
            <a href="https://www.youtube.com/@TheIconicFaculty" target="_blank" rel="noreferrer">YOUTUBE</a>
            <span className="separator">/</span>
            <a href="https://wa.me/917780218068" target="_blank" rel="noreferrer">WHATSAPP</a>
            <span className="separator">/</span>
            <Link href="/privacy-policy">PRIVACY POLICY</Link>
          </div>
          <div className="bento-copyright">
            &copy; 2026 ICONIC FACULTY. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </>
  );
}
