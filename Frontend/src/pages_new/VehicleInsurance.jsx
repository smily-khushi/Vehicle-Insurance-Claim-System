import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { FaCar, FaMotorcycle, FaShieldAlt, FaClock, FaCheckCircle, FaPercentage, FaBolt, FaStar, FaHeadset, FaQuoteLeft, FaAward, FaRobot, FaMapMarkerAlt } from 'react-icons/fa';
import ClaimForm from '../components/ClaimForm';
import { motion, useInView } from 'framer-motion';

/* ─── Reusable scroll-triggered fade-in wrapper ─────────────── */
function FadeIn({ children, delay = 0, direction = 'up', className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const variants = {
        hidden: { opacity: 0, y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0, x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0 },
        visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } }
    };
    return (
        <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={variants} className={className}>
            {children}
        </motion.div>
    );
}

/* ─── Animated Counter Hook ─────────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

/* ─── Single Stat Card ───────────────────────────────────────── */
function StatCard({ value, suffix, label, icon, started }) {
    const count = useCountUp(value, 2000, started);
    return (
        <div className="text-center p-4">
            <div className="mb-2" style={{ fontSize: '1.8rem', color: '#818cf8' }}>{icon}</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {count.toLocaleString()}{suffix}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', marginTop: '4px' }}>{label}</div>
        </div>
    );
}

const VehicleInsurance = ({ user }) => {
    const [activeTab, setActiveTab] = useState('car');
    const navigate = useNavigate();
    const claimRef = useRef(null);

    // Stats counter
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setStatsVisible(true);
        }, { threshold: 0.3 });
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    // Claim Form State
    const [claimStep, setClaimStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submittedClaim, setSubmittedClaim] = useState(null);
    const [claimData, setClaimData] = useState({
        policyNumber: '',
        vehicleReg: '',
        incidentDate: '',
        incidentLocation: '',
        description: ''
    });
    const [hasFIR, setHasFIR] = useState(false);
    const [files, setFiles] = useState({
        policyDocument: null,
        repairEstimate: null,
        firDocument: null
    });

    const todayIso = new Date().toISOString().split('T')[0];

    const handleClaimChange = (e) => {
        setClaimData({ ...claimData, [e.target.name]: e.target.value });
    };
    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (claimData.incidentDate && claimData.incidentDate > todayIso) {
            alert('Incident date cannot be in the future.');
            return;
        }
        if (!user) {
            alert('Please login to raise a claim.');
            navigate('/login');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('policyNumber', claimData.policyNumber);
            formData.append('userName', user.fullName);
            formData.append('userEmail', user.email);
            formData.append('vehicleNumber', claimData.vehicleReg);
            formData.append('incidentDate', claimData.incidentDate);
            formData.append('description', `Location: ${claimData.incidentLocation}. ${claimData.description}`);
            if (files.policyDocument) formData.append('policyDocument', files.policyDocument);
            if (files.repairEstimate) formData.append('repairEstimate', files.repairEstimate);
            if (hasFIR && files.firDocument) formData.append('firDocument', files.firDocument);

            const response = await fetch('http://localhost:5000/api/claims', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setSubmittedClaim(data);
                setSubmitSuccess(true);
            } else {
                alert(data.message);
            }
        } catch {
            alert('Error submitting claim. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setClaimStep(claimStep + 1);
    const prevStep = () => setClaimStep(claimStep - 1);

    const scrollToClaim = () => {
        claimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const benefits = [
        { icon: <FaShieldAlt className="text-primary display-6 mb-3" />, title: "Super Fast Claims", description: "Most of our claims are settled instantly or within a few hours." },
        { icon: <FaPercentage className="text-success display-6 mb-3" />, title: "Zero Commission", description: "Buy directly from us and save up to 70% on your premium." },
        { icon: <FaClock className="text-info display-6 mb-3" />, title: "100% Digital", description: "No paperwork. Everything from buying to claims is handled on your phone." },
        { icon: <FaCheckCircle className="text-warning display-6 mb-3" />, title: "Trusted by Millions", description: "Over 5 million happy customers trust us with their vehicle protection." }
    ];

    // const faqs = [
    //     { q: "What documents are required to buy vehicle insurance?", a: "With SafeDrive, you don't need any physical documents. Just your vehicle registration number and previous policy details (if any) are enough to get started." },
    //     { q: "Does my insurance cover damage from natural calamities?", a: "Yes, our Comprehensive and Standard plans cover damages caused by floods, earthquakes, storms, and other natural disasters." },
    //     { q: "What is Zero Depreciation cover?", a: "Zero Dep means you get the full claim amount without any deduction for depreciation on replaced parts. It's highly recommended for new vehicles." },
    //     { q: "How do I renew my expired policy?", a: "Renewing your expired policy is easy. Just enter your registration number, and we might require a quick inspection (which can often be done via our app) before renewing." }
    // ];

    /* ── Coverage comparison data ──────────────────────────── */
    const coverageItems = [
        { feature: 'Third-party Liability', basic: true, standard: true, premium: true },
        { feature: 'Personal Accident Cover', basic: true, standard: true, premium: true },
        { feature: 'Comprehensive Damage', basic: false, standard: true, premium: true },
        { feature: 'Natural Calamity Cover', basic: false, standard: true, premium: true },
        { feature: 'Zero Depreciation', basic: false, standard: true, premium: true },
        { feature: 'Engine Protection', basic: false, standard: false, premium: true },
        { feature: 'Consumables Cover', basic: false, standard: false, premium: true },
        { feature: 'International Assistance', basic: false, standard: false, premium: true },
    ];

    return (
        <div className="vehicle-insurance-page pb-5">

            {/* ── Hero Section ────────────────────────────────── */}
            <div className="py-5 mb-5 border-bottom border-opacity-10 border-white" style={{ background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent)' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col lg={7} className="mb-4 mb-lg-0">
                            <FadeIn delay={0.1}>
                                <Badge bg="transparent" className="text-primary px-3 py-2 rounded-pill mb-3 border border-primary border-opacity-25 d-inline-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}>
                                    <FaStar style={{ fontSize: '0.7rem' }} /> #1 Rated Vehicle Insurance Platform
                                </Badge>
                                <h1 className="display-4 fw-bold mb-3 text-white">Vehicle Insurance made <span className="text-gradient">Incredibly Easy</span></h1>
                                <p className="lead text-secondary opacity-75 mb-4">Save up to ₹5,000 on car insurance and ₹1,500 on bike insurance. Buy in just 2 minutes.</p>

                                {/* Tab selector + CTA card */}
                                <Card className="border-0 shadow-lg p-3 p-md-4 rounded-4 glass-panel">
                                    {/* Vehicle type pills */}
                                    <div className="d-flex gap-2 mb-4">
                                        {[
                                            { key: 'car', label: 'Car', icon: <FaCar className="me-2" /> },
                                            { key: 'bike', label: 'Bike', icon: <FaMotorcycle className="me-2" /> }
                                        ].map(({ key, label, icon }) => (
                                            <button
                                                key={key}
                                                onClick={() => setActiveTab(key)}
                                                className="d-flex align-items-center px-4 py-2 rounded-3 border-0 fw-semibold"
                                                style={{
                                                    background: activeTab === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                                                    color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.55)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.25s ease',
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {icon}{label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Quick-action area */}
                                    <div className="py-2">
                                        <h5 className="mb-1 text-white fw-bold">
                                            {activeTab === 'car' ? '🚗 Car Insurance' : '🏍️ Bike Insurance'}
                                        </h5>
                                        <p className="small mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {activeTab === 'car'
                                                ? 'Get comprehensive car coverage starting at ₹29/month'
                                                : 'Get comprehensive bike coverage starting at ₹19/month'}
                                        </p>
                                        <div className="d-flex flex-wrap gap-3">
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                className="px-4 rounded-3 fw-bold flex-grow-1"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
                                                onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
                                            >
                                                <FaBolt className="me-2" />View Plans &amp; Prices
                                            </Button>
                                            <Button
                                                variant="outline-light"
                                                size="lg"
                                                className="px-4 rounded-3 fw-semibold flex-grow-1"
                                                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
                                                onClick={scrollToClaim}
                                            >
                                                Raise a Claim
                                            </Button>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mt-3" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
                                            <FaShieldAlt style={{ fontSize: '0.75rem', color: '#818cf8' }} />
                                            No paperwork · Instant policy · 24/7 support
                                        </div>
                                    </div>
                                </Card>
                            </FadeIn>
                        </Col>

                        {/* Floating vehicle icon with glow */}
                        <Col lg={5} className="text-center d-none d-lg-block">
                            <FadeIn delay={0.3} direction="left">
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <div style={{
                                        position: 'absolute', inset: '-20px',
                                        background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)',
                                        borderRadius: '50%'
                                    }} />
                                    <div className="p-5 glass-panel rounded-circle shadow-sm d-inline-block border border-primary border-opacity-25 animate-float">
                                        {activeTab === 'car'
                                            ? <FaCar className="display-1 text-primary" />
                                            : <FaMotorcycle className="display-1 text-primary" />}
                                    </div>
                                    {/* Feature chips */}
                                    <div style={{ position: 'absolute', top: '10%', right: '-30px' }}
                                        className="px-3 py-2 rounded-3 glass-panel d-flex align-items-center gap-2 shadow">
                                        <FaCheckCircle style={{ color: '#10b981' }} />
                                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>Instant Approval</span>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '10%', left: '-30px' }}
                                        className="px-3 py-2 rounded-3 glass-panel d-flex align-items-center gap-2 shadow">
                                        <FaHeadset style={{ color: '#818cf8' }} />
                                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>24/7 Support</span>
                                    </div>
                                </div>
                            </FadeIn>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ── Animated Stats Section ───────────────────────── */}
            <div ref={statsRef} className="py-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Container>
                    <Row className="g-0">
                        {[
                            { value: 5000000, suffix: '+', label: 'Happy Customers', icon: <FaStar /> },
                            { value: 98, suffix: '%', label: 'Claim Settlement Rate', icon: <FaCheckCircle /> },
                            { value: 2, suffix: 'min', label: 'Avg. Buy Time', icon: <FaBolt /> },
                            { value: 24, suffix: '/7', label: 'Support Available', icon: <FaHeadset /> },
                        ].map((s, i) => (
                            <Col key={i} xs={6} md={3}>
                                <StatCard {...s} started={statsVisible} />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* ── Benefits Section ───────────────────────────────── */}
            <Container className="py-5">
                <div className="text-center mb-5 animate-up">
                    <Badge bg="transparent" className="text-primary px-3 py-2 rounded-pill mb-3 border border-primary border-opacity-25" style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}>Why SafeDrive?</Badge>
                    <h2 className="fw-bold text-white">Insurance that actually works for you</h2>
                </div>
                <Row>
                    {benefits.map((benefit, index) => (
                        <Col md={3} sm={6} key={index} className="mb-4 text-center">
                            <FadeIn delay={index * 0.12}>
                                <div className="p-4 h-100 rounded-4 glass-panel transition-hover">
                                    {benefit.icon}
                                    <h5 className="fw-bold mb-3 text-white">{benefit.title}</h5>
                                    <p className="text-secondary opacity-75 small">{benefit.description}</p>
                                </div>
                            </FadeIn>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* ── Coverage Comparison Table ────────────────────── */}
            <div id="plans" className="py-5" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container>
                    <div className="text-center mb-5 animate-up">
                        <Badge bg="transparent" className="text-success px-3 py-2 rounded-pill mb-3 border border-success border-opacity-25" style={{ backgroundColor: 'rgba(16,185,129,0.08)' }}>Compare Plans</Badge>
                        <h2 className="fw-bold text-white">Find the right cover for you</h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)' }}>All plans include 24/7 roadside assistance and a dedicated claim manager.</p>
                    </div>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <div className="rounded-4 overflow-hidden glass-panel shadow-lg">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(99,102,241,0.15)' }}>
                                            <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, width: '40%' }}>Coverage Feature</th>
                                            {[
                                                { name: 'Basic', price: '₹29', color: '#94a3b8' },
                                                { name: 'Standard', price: '₹59', color: '#818cf8', best: true },
                                                { name: 'Premium', price: '₹99', color: '#c084fc' }
                                            ].map(plan => (
                                                <th key={plan.name} style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                    {plan.best && (
                                                        <div style={{ fontSize: '0.65rem', color: '#818cf8', letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase' }}>⭐ Best Value</div>
                                                    )}
                                                    <div style={{ color: plan.color, fontWeight: 700, fontSize: '1rem' }}>{plan.name}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{plan.price}/mo</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coverageItems.map((row, i) => (
                                            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                                                <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{row.feature}</td>
                                                {[row.basic, row.standard, row.premium].map((has, j) => (
                                                    <td key={j} style={{ textAlign: 'center', padding: '13px 12px' }}>
                                                        {has
                                                            ? <FaCheckCircle style={{ color: '#10b981', fontSize: '1.1rem' }} />
                                                            : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.1rem' }}>—</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(99,102,241,0.06)' }}>
                                            <td style={{ padding: '16px 20px' }} />
                                            {[
                                                { label: 'Choose Basic', variant: 'rgba(255,255,255,0.06)', color: '#fff' },
                                                { label: 'Choose Standard', variant: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' },
                                                { label: 'Choose Premium', variant: 'rgba(192,132,252,0.15)', color: '#c084fc' }
                                            ].map((btn, j) => (
                                                <td key={j} style={{ textAlign: 'center', padding: '16px 12px' }}>
                                                    <button
                                                        onClick={scrollToClaim}
                                                        style={{
                                                            background: btn.variant,
                                                            color: btn.color,
                                                            border: j === 1 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                                            borderRadius: '30px',
                                                            padding: '8px 20px',
                                                            fontWeight: 600,
                                                            fontSize: '0.82rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {btn.label}
                                                    </button>
                                                </td>
                                            ))}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ── Claim Section (New Multi-Step Form) ───────────── */}
            <Container className="py-5 my-5" ref={claimRef}>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <div className="claim-container p-4 p-md-5 rounded-4 shadow-lg glass-panel animate-up">
                            <div className="text-center mb-5">
                                <Badge bg="transparent" className="text-danger px-3 py-2 rounded-pill mb-3 border border-danger border-opacity-25" style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}>Claim Process</Badge>
                                <h2 className="fw-bold mb-3 text-white">Need to Raise a Claim?</h2>
                                <p className="text-secondary opacity-75">Fill out the form below to submit your vehicle insurance claim.</p>
                            </div>
                            <ClaimForm />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default VehicleInsurance;
