"use client";
import { useEffect, useRef, useState } from 'react';
import ParticleText from '../components/ParticleText';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);

  useEffect(() => {
    // Navbar scroll effect
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Handle delayed animations using inline CSS variables
          const delay = entry.target.style.getPropertyValue('--delay');
          if (delay) {
            entry.target.style.transitionDelay = delay;
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with reveal classes
    document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Parallax effect for floating cards
  const handleMouseMove = (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    
    if (card1Ref.current) {
      card1Ref.current.style.transform = `translate(${xAxis * 1}px, ${yAxis * 1}px)`;
    }
    if (card2Ref.current) {
      card2Ref.current.style.transform = `translate(${xAxis * -1}px, ${yAxis * -1}px)`;
    }
  };

  const handleMouseLeave = () => {
    if (card1Ref.current) {
      card1Ref.current.style.transform = `translate(0px, 0px)`;
      card1Ref.current.style.transition = 'transform 0.5s ease';
    }
    if (card2Ref.current) {
      card2Ref.current.style.transform = `translate(0px, 0px)`;
      card2Ref.current.style.transition = 'transform 0.5s ease';
    }
  };

  const handleMouseEnter = () => {
    if (card1Ref.current) card1Ref.current.style.transition = 'none';
    if (card2Ref.current) card2Ref.current.style.transition = 'none';
  };

  return (
    <>
      <nav className="pill-navbar reveal-nav">
        <div className="nav-links">
          <a href="#" className="nav-link active">HOME</a>
          <a href="#about" className="nav-link">ABOUT</a>
          <a href="#featured-videos" className="nav-link">TALKS</a>
          <a href="#resources" className="nav-link">RESOURCES</a>
          <a href="https://www.youtube.com/@TheIconicFaculty" target="_blank" rel="noreferrer" className="nav-link">SUBSCRIBE</a>
        </div>
      </nav>

      <main>
        <section className="hero-new">
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
            <h2 className="section-title">Resources</h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem' }}>
              High-quality, free educational materials are coming soon. Stay tuned!
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="logo">
            ICONIC FACULTY
          </div>
          <p>Empowering intermediate students with free education.</p>
          <div className="social-links">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-link">YouTube</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Iconic Faculty. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
