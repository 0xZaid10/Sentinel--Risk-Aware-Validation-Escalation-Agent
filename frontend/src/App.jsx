import React, { useState } from 'react';
import { Shield, Lock, GitBranch, Github, Globe, MessageCircle, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Clock, Database, Eye, EyeOff, FileText, Layers, Activity } from 'lucide-react';

const SentinelWebsite = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [objective, setObjective] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [error, setError] = useState(null);

  // API configuration - update this URL to match your API deployment
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleRunEvaluation = async () => {
    if (!objective.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objective: objective.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response to match frontend structure
      setResult({
        verdict: data.final_verdict,
        confidence: data.confidence,
        threshold: data.threshold || 0.85,
        escalation_path: data.escalation_path.join(' → '),
        attempts: data.total_attempts,
        reason: data.decision_reason,
        latency: `${(data.total_latency_ms / 1000).toFixed(1)}s`,
        decision_id: data.decision_id,
        artifact_hash: data.artifact_hash,
        signature: data.signature,
        timestamp: data.timestamp,
        output: data.output,
        validator_runs: data.validator_runs || []
      });
      
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err.message || 'Failed to evaluate objective. Please check your API connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch(verdict) {
      case 'ACCEPT': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'MANUAL_REVIEW': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'FAIL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch(verdict) {
      case 'ACCEPT': return <CheckCircle2 className="w-5 h-5" />;
      case 'MANUAL_REVIEW': return <AlertTriangle className="w-5 h-5" />;
      case 'FAIL': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
            <span className="text-xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Sentinel
            </span>
          </div>
          
          <nav className="flex items-center gap-8">
            <button 
              onClick={() => setActiveSection('home')}
              className={`text-sm font-medium transition-colors ${activeSection === 'home' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveSection('agent')}
              className={`text-sm font-medium transition-colors ${activeSection === 'agent' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              Agent
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <a href="https://github.com" className="text-slate-500 hover:text-slate-900 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://cortensor.com" className="text-slate-500 hover:text-slate-900 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="https://discord.com" className="text-slate-500 hover:text-slate-900 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {activeSection === 'home' ? (
          <>
            {/* Hero Section */}
            <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/20">
                  <Shield className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Sentinel
                </h1>
                
                <p className="text-2xl text-slate-600 mb-4 font-medium tracking-tight" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Risk-Aware Validation & Escalation Agent
                </p>
                
                <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  A deterministic AI trust firewall built on Cortensor that enforces redundancy, weighted consensus, and composite confidence before allowing high-stakes governance decisions to be accepted.
                </p>
                
                <button 
                  onClick={() => setActiveSection('agent')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30"
                  style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                >
                  Open Agent Interface
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* The Problem Section */}
            <section className="py-20 px-6 border-t border-slate-200 bg-slate-50">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  The Core Problem
                </h2>
                <p className="text-lg text-slate-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  The more convincing an AI system becomes, the more dangerous unchecked output becomes in high-stakes environments.
                </p>

                <div className="bg-white p-8 rounded-xl border border-slate-200 mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Traditional AI Systems Follow a Simple Flow
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-slate-600 font-mono text-sm mb-6">
                    <span>User prompt</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Model inference</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Output returned</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Even when redundancy is used, most systems rely on simplistic mechanisms like majority voting, averaging confidence scores, or blind trust in the highest confidence output. These approaches fail in governance environments because they don't answer the critical question:
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl text-center mb-8">
                  <p className="text-2xl font-semibold mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    "Is this output trustworthy enough to act upon?"
                  </p>
                  <p className="text-slate-400" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    The fundamental question traditional systems fail to address
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        High-Stakes Failures
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• Irreversible capital loss</li>
                      <li>• Governance corruption</li>
                      <li>• Regulatory exposure</li>
                      <li>• Systemic instability</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Critical Use Cases
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• DAO treasury allocations</li>
                      <li>• DeFi liquidity approvals</li>
                      <li>• Regulatory compliance</li>
                      <li>• Autonomous agent actions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* What Sentinel Is */}
            <section className="py-20 px-6 border-t border-slate-200">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  What Sentinel Is
                </h2>
                <p className="text-lg text-slate-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Sentinel is a deterministic, policy-driven AI trust firewall that sits between AI-generated outputs and execution environments.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      <CheckCircle2 className="w-5 h-5" />
                      Sentinel Does
                    </h3>
                    <ul className="space-y-3 text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                        <span>Orchestrates validation and redundancy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                        <span>Computes weighted consensus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                        <span>Enforces trust thresholds deterministically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                        <span>Generates cryptographic decision artifacts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0"></div>
                        <span>Converts probabilistic inference into deterministic decision gating</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      <XCircle className="w-5 h-5" />
                      Sentinel Does Not
                    </h3>
                    <ul className="space-y-3 text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span>Generate original intelligence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span>Act as a language model</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span>Provide advice or speculate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span>Hallucinate or guess</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                        <span>Replace human judgment</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-100 p-8 rounded-xl text-center">
                  <p className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Purpose: Enforcement, Not Reasoning
                  </p>
                  <p className="text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Sentinel is a governance safeguard layer that transforms AI inference into governed decision-making
                  </p>
                </div>
              </div>
            </section>

            {/* Architecture Section */}
            <section className="py-20 px-6 border-t border-slate-200 bg-slate-50">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  System Architecture
                </h2>
                <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Four core domains operating sequentially and deterministically
                </p>

                {/* Operational Flow */}
                <div className="bg-white p-8 rounded-xl border border-slate-200 mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Internal Operational Flow
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-700">
                    <span className="bg-slate-100 px-3 py-2 rounded">DELEGATE</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">COMPLETE</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">VALIDATE</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">ESCALATE</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">COMPUTE TRUST</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">ISSUE VERDICT</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">GENERATE ARTIFACT</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="bg-slate-100 px-3 py-2 rounded">PERSIST RECORD</span>
                  </div>
                  <div className="mt-6 grid md:grid-cols-4 gap-4 text-center text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    <div>Every step is auditable</div>
                    <div>Every decision is reconstructable</div>
                    <div>Every escalation path is stored</div>
                    <div>Every validator vote is preserved</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                      <GitBranch className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Delegation & Execution Coordination
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      Coordinates distributed inference across Cortensor's decentralized network with independent validator surfaces and miner diversity.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>Routes tasks to independent compute nodes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>Ensures validator independence</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-8 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Multi-Validator Redundancy
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      Enforces tier-based redundancy with deterministic escalation ladders from 1→3→5 validators based on risk level.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>Automatic escalation on low confidence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>Risk-appropriate validation depth</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-8 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Composite Trust Computation
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      Weighted consensus combining validator agreement (60%) and average confidence (40%) to prevent false consensus.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>Prevents weak validator dominance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>Balances agreement with certainty</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-8 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Escalation & Enforcement
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      State machine enforcement with cryptographically auditable decision artifacts and circuit breaker safe-mode protection.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>SHA256 artifact hashing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                        <span>On-chain proof anchoring ready</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Model Section */}
            <section className="py-20 px-6 border-t border-slate-200">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  The Trust Model
                </h2>
                <p className="text-slate-600 text-center mb-12" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Sentinel does not rely on naive majority voting. It computes composite trust using weighted components.
                </p>

                <div className="bg-slate-50 p-10 rounded-xl border border-slate-200 shadow-sm mb-8">
                  <div className="text-center mb-8">
                    <p className="text-sm text-slate-500 mb-3" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Composite Confidence Formula</p>
                    <code className="text-2xl font-mono text-slate-900 bg-white px-6 py-3 rounded-lg inline-block border border-slate-200">
                      0.6 × weighted_agreement + 0.4 × average_confidence
                    </code>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-sm">
                          60%
                        </div>
                        <p className="font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                          Weighted Validator Agreement
                        </p>
                      </div>
                      <p className="text-slate-600 mb-3" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        Each validator's vote is weighted by its individual confidence score. Calculates: valid_weight / total_weight
                      </p>
                      <div className="text-sm text-slate-500 space-y-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        <p>✓ Prevents weak validators from overpowering stronger ones</p>
                        <p>✓ Eliminates blind majority dominance</p>
                        <p>✓ Blocks low-confidence consensus</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-sm">
                          40%
                        </div>
                        <p className="font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                          Average Validator Confidence
                        </p>
                      </div>
                      <p className="text-slate-600 mb-3" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        Mean confidence across all validators, capturing overall certainty across the validator set.
                      </p>
                      <div className="text-sm text-slate-500 space-y-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        <p>✓ Prevents high-confidence minorities from dominating</p>
                        <p>✓ Captures overall validator certainty</p>
                        <p>✓ Dampens false consensus scenarios</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl text-center">
                  <p className="text-lg font-semibold mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Sentinel does not guess. It computes.
                  </p>
                  <p className="text-slate-400 text-sm" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Result is clamped between 0.0 and 1.0, rounded to three decimals
                  </p>
                </div>
              </div>
            </section>

            {/* Redundancy Tiers */}
            <section className="py-20 px-6 border-t border-slate-200 bg-slate-50">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Deterministic Redundancy Tiers
                </h2>
                <p className="text-slate-600 text-center mb-4 max-w-2xl mx-auto" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Tier-based redundancy thresholds with escalation ladders for different risk levels
                </p>
                <p className="text-sm text-slate-500 text-center mb-12" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Escalation is not retry. Escalation is deterministic redundancy enforcement.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-900 text-white p-6">
                      <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Tier 1
                      </h3>
                      <p className="text-slate-300 text-sm" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        Low Risk
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Threshold</p>
                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>0.50</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Escalation Ladder</p>
                        <p className="font-mono text-slate-900">1 → 3 → 5</p>
                      </div>
                      <div className="text-sm text-slate-600 space-y-2 mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        <p>• Accept if ≥ 0.50 at any stage</p>
                        <p>• Fail if &lt; 0.50 after level 5</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                          Used for lower-stakes decisions where failure risk is limited
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-900 text-white p-6">
                      <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Tier 3
                      </h3>
                      <p className="text-slate-300 text-sm" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        Balanced
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Threshold</p>
                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>0.65</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Escalation Ladder</p>
                        <p className="font-mono text-slate-900">3 → 5</p>
                      </div>
                      <div className="text-sm text-slate-600 space-y-2 mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        <p>• Accept if ≥ 0.65</p>
                        <p>• Manual review otherwise</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                          Does not allow automatic fail. Escalates to human review when confidence insufficient.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-900 text-white p-6">
                      <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Tier 5
                      </h3>
                      <p className="text-slate-300 text-sm" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        Oracle
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Threshold</p>
                        <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>0.85</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Escalation Ladder</p>
                        <p className="font-mono text-slate-900">3 → 5</p>
                      </div>
                      <div className="text-sm text-slate-600 space-y-2 mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        <p>• Accept if ≥ 0.85</p>
                        <p>• Manual review otherwise</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                          Enforces extremely high confidence. Never auto-fails. Defers to human governance when trust insufficient.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Cortensor Section */}
            <section className="py-20 px-6 border-t border-slate-200">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Why Cortensor Is Core to Sentinel
                </h2>
                <p className="text-lg text-slate-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Sentinel relies fundamentally on Cortensor's decentralized inference network. Without Cortensor, Sentinel would be forced to rely on centralized model redundancy, which defeats the purpose of decentralization in governance contexts.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      What Cortensor Provides
                    </h3>
                    <ul className="space-y-3 text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Distributed inference execution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Redundant miner diversity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Independent validator surfaces</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Proof-of-Inference (PoI)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Proof-of-Useful-Work (PoUW)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Structured delegation and validation endpoints</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Independent miner-level output diversity</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      What Cortensor Ensures
                    </h3>
                    <ul className="space-y-3 text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 flex-shrink-0"></div>
                        <span>Validation runs originate from independent compute nodes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 flex-shrink-0"></div>
                        <span>Miner diversity reduces correlated hallucination risk</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 flex-shrink-0"></div>
                        <span>Redundancy is structurally enforced at the network level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 flex-shrink-0"></div>
                        <span>Proof signals can be cryptographically interpreted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 flex-shrink-0"></div>
                        <span>Consensus is not single-source dependent</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <p className="text-lg font-semibold mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Cortensor
                      </p>
                      <p className="text-slate-300" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        The compute backbone
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Sentinel
                      </p>
                      <p className="text-slate-300" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        The deterministic trust enforcer
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-700 text-center">
                    <p className="text-xl font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Together they form a trust-aware decentralized AI governance stack
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Decision Artifacts & Storage */}
            <section className="py-20 px-6 border-t border-slate-200 bg-slate-50">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Decision Artifacts & Persistence
                </h2>
                <p className="text-slate-600 text-center mb-12 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Every decision produces a structured, cryptographically verifiable artifact. Sentinel does not hide disagreement—it preserves it.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-8 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6 text-slate-900" />
                      <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Artifact Includes
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono text-slate-600">
                      <div>• decision_id</div>
                      <div>• schema_version</div>
                      <div>• session_id</div>
                      <div>• composite_confidence</div>
                      <div>• threshold_applied</div>
                      <div>• final_verdict</div>
                      <div>• escalation_path</div>
                      <div>• artifact_hash</div>
                      <div>• signature</div>
                      <div>• timestamp</div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="w-6 h-6 text-slate-900" />
                      <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Validator Records
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono text-slate-600">
                      <div>• redundancy_level</div>
                      <div>• miner_address</div>
                      <div>• valid flag</div>
                      <div>• confidence_score</div>
                      <div>• overall_score</div>
                      <div>• risk_level</div>
                      <div>• data_hash</div>
                      <div>• timestamp</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Artifacts Enable
                  </h3>
                  <div className="grid md:grid-cols-5 gap-4 text-center">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <Lock className="w-6 h-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Governance Defense</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <Activity className="w-6 h-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Audit Reconstruction</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Compliance Verification</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <GitBranch className="w-6 h-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Dispute Arbitration</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <Database className="w-6 h-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>On-Chain Anchoring</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-6" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Stored in PostgreSQL • SHA256 hashed • Ready for Arbitrum Sepolia anchoring
                  </p>
                </div>
              </div>
            </section>

            {/* Governance Applications */}
            <section className="py-20 px-6 border-t border-slate-200">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Governance Applications
                </h2>
                <p className="text-slate-600 text-center mb-12 max-w-3xl mx-auto" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Sentinel converts probabilistic AI outputs into enforceable governance decisions
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      DAO & DeFi
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• DAO treasury allocation approval</li>
                      <li>• DeFi liquidity deployment gating</li>
                      <li>• Governance proposal validation</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Smart Contracts
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• Smart contract release approval</li>
                      <li>• Cross-chain bridge deployment</li>
                      <li>• Multi-signature validation</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Compliance & AI
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• Compliance document validation</li>
                      <li>• Autonomous agent action gating</li>
                      <li>• Institutional AI deployment approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* System Identity */}
            <section className="py-20 px-6 border-t border-slate-200 bg-slate-900 text-white">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  System Identity
                </h2>
                
                <div className="bg-slate-800 p-8 rounded-xl mb-8 border border-slate-700">
                  <p className="text-xl leading-relaxed text-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    "A deterministic, composite-consensus, redundancy-escalating, cryptographically auditable AI trust firewall built on top of Cortensor's decentralized inference network."
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-400" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      What Sentinel Guarantees
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• Deterministic escalation</li>
                      <li>• Composite-weighted consensus</li>
                      <li>• Structured artifact persistence</li>
                      <li>• Cryptographic decision integrity</li>
                      <li>• Audit transparency</li>
                      <li>• Validator-level accountability</li>
                      <li>• Safe-mode override protection</li>
                      <li>• Redundancy enforcement</li>
                      <li>• Policy-tier governance alignment</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-amber-400" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      What Sentinel Does Not Guarantee
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      <li>• Absolute truth</li>
                      <li>• Perfect risk assessment</li>
                      <li>• Economic outcome prediction</li>
                      <li>• Validator honesty</li>
                      <li>• External system integrity</li>
                    </ul>
                    <p className="mt-4 text-sm text-slate-400 italic" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                      Sentinel enforces structured trust thresholds. It does not replace human judgment.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-semibold mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Philosophical Distinction
                  </p>
                  <p className="text-lg text-slate-300 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Most AI systems answer.
                  </p>
                  <p className="text-lg text-white font-semibold mb-4" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    Sentinel judges whether answers are trustworthy enough to act upon.
                  </p>
                  <p className="text-slate-400" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    It does not create intelligence. It governs it.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 border-t border-slate-200">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Experience Sentinel
                </h2>
                <p className="text-lg text-slate-600 mb-8" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Test the deterministic trust firewall with your own governance decisions
                </p>
                <button 
                  onClick={() => setActiveSection('agent')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30"
                  style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                >
                  Open Agent Interface
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </section>
          </>
        ) : (
          /* Agent Page */
          <section className="py-12 px-6 min-h-[calc(100vh-5rem)]">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  Sentinel Agent Interface
                </h1>
                <p className="text-slate-600" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Submit governance decisions for deterministic validation
                </p>
              </div>

              {/* Input Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 mb-3" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  Enter Objective
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Describe the governance decision requiring validation…"
                  className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-slate-900"
                  style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                />
                
                <button
                  onClick={handleRunEvaluation}
                  disabled={!objective.trim() || isLoading}
                  className="mt-4 w-full px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
                  style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                >
                  {isLoading ? 'Running Sentinel Evaluation...' : 'Run Sentinel Evaluation'}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                          Evaluation Failed
                        </p>
                        <p className="text-sm text-red-700" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Section */}
              {result && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Verdict Card */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Decision Verdict
                      </h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Verdict</p>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold ${getVerdictColor(result.verdict)}`}>
                            {getVerdictIcon(result.verdict)}
                            <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{result.verdict}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Composite Confidence</p>
                          <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                            {result.confidence.toFixed(3)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Threshold Applied</p>
                          <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                            {result.threshold.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Escalation Path</p>
                          <p className="font-mono text-slate-900">{result.escalation_path}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Attempts</p>
                          <p className="font-mono text-slate-900">{result.attempts}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Latency</p>
                          <p className="font-mono text-slate-900">{result.latency}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Decision Reason</p>
                        <p className="text-sm text-slate-700 leading-relaxed" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                          {result.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Validator Runs */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Validator Runs
                      </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Level</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Miner Address</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Valid</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Confidence</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Risk Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {result.validator_runs.map((run, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-mono text-slate-900">{run.redundancy_level}</td>
                              <td className="px-6 py-4 text-sm font-mono text-slate-600">{run.miner_address}</td>
                              <td className="px-6 py-4">
                                {run.valid ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-slate-900">{run.confidence_score.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                  run.risk_level === 'LOW' || run.risk_level === 'low' ? 'bg-emerald-100 text-emerald-700' :
                                  run.risk_level === 'MEDIUM' || run.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {run.risk_level.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Artifact Summary */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        Artifact Summary
                      </h2>
                      <button
                        onClick={() => setShowRawData(!showRawData)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                      >
                        {showRawData ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide Raw Data
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Show Raw Data
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Decision ID</p>
                          <p className="font-mono text-sm text-slate-900 break-all">{result.decision_id}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Timestamp</p>
                          <p className="font-mono text-sm text-slate-900">{new Date(result.timestamp).toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Artifact Hash</p>
                        <p className="font-mono text-xs text-slate-700 break-all bg-slate-50 p-3 rounded border border-slate-200">
                          {result.artifact_hash}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Signature</p>
                        <p className="font-mono text-xs text-slate-700 break-all bg-slate-50 p-3 rounded border border-slate-200">
                          {result.signature}
                        </p>
                      </div>

                      {showRawData && (
                        <div className="mt-4">
                          <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>Raw Artifact Data</p>
                          <pre className="font-mono text-xs text-slate-700 bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-900 font-semibold mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            Sentinel
          </p>
          <p className="text-sm text-slate-600 mb-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
            Deterministic AI Trust Firewall
          </p>
          <p className="text-sm text-slate-500" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
            Built on Cortensor
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SentinelWebsite;
