import React, { useState, useCallback, useRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import './App.css';

const MODELS = [
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic', color: '#D4A574', keyName: 'CLAUDE_OPUS_4_6' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', color: '#74B9A5', keyName: 'GPT_5' },
  { id: 'glm-5', name: 'GLM-5', provider: 'Zhipu AI', color: '#7494B9', keyName: 'GLM_5' },
  { id: 'openevidence', name: 'OpenEvidence', provider: 'Manual Paste', color: '#B974A5', keyName: null },
];

const JUDGE_MODELS = [
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI' },
  { id: 'glm-5', name: 'GLM-5', provider: 'Zhipu AI' },
];

const METRICS_SHORT = {
  medical_necessity: 'Med. Necessity',
  clinical_evidence: 'Clinical Evidence',
  plan_language: 'Plan Language',
  legal_regulatory: 'Legal/Regulatory',
  denial_rebuttal: 'Denial Rebuttal',
  patient_specific: 'Patient-Specific',
  structural_completeness: 'Structure',
  persuasive_tone: 'Tone',
  actionable_request: 'Actionable Ask',
  supporting_docs: 'Supporting Docs',
  urgency_timeline: 'Urgency/Timeline',
  precedent_history: 'Precedent',
  readability: 'Readability',
  required_elements: 'Required Elements',
  overall_effectiveness: 'Effectiveness',
};

// ─── ICONS (inline SVGs) ───
const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconScale = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const IconExpand = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

// ─── API Key Settings Panel ───
function ApiKeyPanel({ apiKeys, setApiKeys, useEnvKeys, setUseEnvKeys, isOpen, setIsOpen }) {
  return (
    <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
      <button className="settings-toggle" onClick={() => setIsOpen(!isOpen)}>
        <IconSettings />
        <span>API Configuration</span>
        <span className={`chevron ${isOpen ? 'rotated' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="settings-body">
          <label className="env-toggle">
            <input type="checkbox" checked={useEnvKeys} onChange={e => setUseEnvKeys(e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span>Use server-side .env keys (fallback)</span>
          </label>

          <div className="key-grid">
            {MODELS.filter(m => m.keyName).map(model => (
              <div key={model.id} className="key-input-group">
                <label>
                  <span className="model-dot" style={{ background: model.color }} />
                  {model.name}
                </label>
                <input
                  type="password"
                  placeholder={`${model.provider} API key`}
                  value={apiKeys[model.id] || ''}
                  onChange={e => setApiKeys(prev => ({ ...prev, [model.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Model Selection Chips ───
function ModelSelector({ selectedModels, setSelectedModels }) {
  const toggle = id => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="model-selector">
      <span className="selector-label">Include in comparison:</span>
      <div className="model-chips">
        {MODELS.map(m => (
          <button
            key={m.id}
            className={`chip ${selectedModels.includes(m.id) ? 'active' : ''}`}
            onClick={() => toggle(m.id)}
            style={selectedModels.includes(m.id) ? { borderColor: m.color, background: m.color + '18' } : {}}
          >
            <span className="model-dot" style={{ background: m.color }} />
            {m.name}
            {selectedModels.includes(m.id) && <IconCheck />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Icons for input mode toggle ───
const IconApi = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
  </svg>
);

const IconPaste = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>
  </svg>
);

// ─── Per-Model Input Card (API vs Paste toggle) ───
function ModelInputCard({ model, inputMode, onToggleMode, pastedText, onPasteChange }) {
  const hasApi = model.keyName !== null;
  const links = {
    'openevidence': { url: 'https://www.openevidence.com', label: 'Open OpenEvidence →' },
  };
  const link = links[model.id];

  return (
    <div className="model-input-card" style={{ '--accent': model.color }}>
      <div className="model-input-header">
        <div className="model-input-info">
          <span className="model-dot" style={{ background: model.color }} />
          <span className="model-input-name">{model.name}</span>
          <span className="provider-badge">{model.provider}</span>
        </div>
        <div className="mode-toggle">
          {hasApi && (
            <button
              className={`mode-btn ${inputMode === 'api' ? 'active' : ''}`}
              onClick={() => onToggleMode('api')}
              title="Generate via API"
            >
              <IconApi /> API
            </button>
          )}
          <button
            className={`mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
            onClick={() => onToggleMode('paste')}
            title="Paste output manually"
          >
            <IconPaste /> Paste
          </button>
        </div>
      </div>

      {inputMode === 'paste' && (
        <div className="model-input-body">
          <textarea
            className="paste-textarea"
            placeholder={`Paste the ${model.name} output here...`}
            value={pastedText}
            onChange={e => onPasteChange(e.target.value)}
            rows={6}
          />
          {link && (
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="oe-link">
              {link.label}
            </a>
          )}
        </div>
      )}

      {inputMode === 'api' && (
        <div className="model-input-body model-input-api-note">
          Will generate via {model.provider} API using your prompt
        </div>
      )}
    </div>
  );
}

// ─── Output Card ───
function OutputCard({ model, output, expanded, onToggleExpand }) {
  const [copied, setCopied] = useState(false);
  const modelInfo = MODELS.find(m => m.id === model);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`output-card ${expanded ? 'expanded' : ''}`} style={{ '--accent': modelInfo?.color || '#888' }}>
      <div className="output-card-header">
        <div className="output-model-info">
          <span className="model-dot" style={{ background: modelInfo?.color }} />
          <h3>{modelInfo?.name || model}</h3>
          <span className="provider-badge">{modelInfo?.provider}</span>
        </div>
        <div className="output-actions">
          <button className="icon-btn" onClick={handleCopy} title="Copy">
            {copied ? <IconCheck /> : <IconCopy />}
          </button>
          <button className="icon-btn" onClick={onToggleExpand} title="Expand">
            <IconExpand />
          </button>
        </div>
      </div>

      {output.status === 'error' ? (
        <div className="output-error">{output.error}</div>
      ) : (
        <div className="output-text">
          <pre>{output.text}</pre>
        </div>
      )}
    </div>
  );
}

// ManualPastePanel replaced by ModelInputCard above

// ─── Score Badge ───
function ScoreBadge({ score, size = 'md' }) {
  const getColor = s => {
    if (s >= 8) return '#2A9D6E';
    if (s >= 6) return '#D4A574';
    if (s >= 4) return '#D48A4C';
    return '#C75050';
  };

  return (
    <span className={`score-badge ${size}`} style={{ '--score-color': getColor(score) }}>
      {typeof score === 'number' ? score.toFixed(1) : score}
    </span>
  );
}

// ─── Radar Comparison Chart ───
function RadarComparison({ evaluation }) {
  if (!evaluation?.evaluations) return null;

  const metricIds = Object.keys(METRICS_SHORT);
  const data = metricIds.map(id => {
    const point = { metric: METRICS_SHORT[id] };
    evaluation.evaluations.forEach(ev => {
      if (ev.metrics?.[id]) {
        point[ev.model] = ev.metrics[id].score;
      }
    });
    return point;
  });

  const colors = {};
  evaluation.evaluations.forEach(ev => {
    const m = MODELS.find(mod => mod.id === ev.model || mod.name === ev.model);
    colors[ev.model] = m?.color || '#888';
  });

  return (
    <div className="radar-container">
      <h3 className="section-title">Metric Comparison</h3>
      <ResponsiveContainer width="100%" height={480}>
        <RadarChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid stroke="#2a2d35" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#8a8f9b', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: '#5a5f6b', fontSize: 10 }}
          />
          {evaluation.evaluations.map(ev => (
            <Radar
              key={ev.model}
              name={ev.model}
              dataKey={ev.model}
              stroke={colors[ev.model]}
              fill={colors[ev.model]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{ background: '#1a1c22', border: '1px solid #2a2d35', borderRadius: 8, fontSize: 13 }}
            itemStyle={{ color: '#ccc' }}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: '#8a8f9b' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Overall Score Bar Chart ───
function OverallScoreChart({ evaluation }) {
  if (!evaluation?.evaluations) return null;

  const data = evaluation.evaluations.map(ev => {
    const m = MODELS.find(mod => mod.id === ev.model || mod.name === ev.model);
    return {
      model: ev.model,
      score: ev.weighted_overall,
      color: m?.color || '#888',
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="overall-chart-container">
      <h3 className="section-title">Overall Weighted Score</h3>
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 65 + 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" horizontal={false} />
          <XAxis type="number" domain={[0, 10]} tick={{ fill: '#5a5f6b', fontSize: 12 }} />
          <YAxis type="category" dataKey="model" tick={{ fill: '#ccc', fontSize: 13 }} width={140} />
          <Tooltip
            contentStyle={{ background: '#1a1c22', border: '1px solid #2a2d35', borderRadius: 8 }}
            formatter={val => [val.toFixed(2), 'Score']}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Detailed Metrics Table ───
function MetricsTable({ evaluation }) {
  if (!evaluation?.evaluations) return null;

  const metricIds = Object.keys(METRICS_SHORT);

  return (
    <div className="metrics-table-container">
      <h3 className="section-title">Detailed Metric Scores</h3>
      <div className="metrics-table-scroll">
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Metric</th>
              {evaluation.evaluations.map(ev => {
                const m = MODELS.find(mod => mod.id === ev.model || mod.name === ev.model);
                return (
                  <th key={ev.model}>
                    <span className="model-dot" style={{ background: m?.color || '#888' }} />
                    {ev.model}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {metricIds.map(id => (
              <tr key={id}>
                <td className="metric-name">{METRICS_SHORT[id]}</td>
                {evaluation.evaluations.map(ev => {
                  const metric = ev.metrics?.[id];
                  return (
                    <td key={ev.model} className="metric-cell">
                      {metric ? (
                        <div className="metric-cell-content">
                          <ScoreBadge score={metric.score} size="sm" />
                          <span className="metric-justification" title={metric.justification}>
                            {metric.justification}
                          </span>
                        </div>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="total-row">
              <td className="metric-name"><strong>Weighted Overall</strong></td>
              {evaluation.evaluations.map(ev => (
                <td key={ev.model} className="metric-cell">
                  <ScoreBadge score={ev.weighted_overall} size="md" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Recommendation Panel ───
function RecommendationPanel({ evaluation }) {
  if (!evaluation) return null;

  return (
    <div className="recommendation-panel">
      <div className="rec-section">
        <h4>Recommendation</h4>
        <p>{evaluation.recommendation}</p>
      </div>
      <div className="rec-section">
        <h4>Improvement Suggestions</h4>
        <p>{evaluation.improvement_suggestions}</p>
      </div>
    </div>
  );
}

// ─── Loading Spinner ───
function Spinner({ label }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

// ════════════════════════════════════════
// ─── MAIN APP ───
// ════════════════════════════════════════
export default function App() {
  // State
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState(['claude-opus-4.6', 'gpt-5']);
  const [apiKeys, setApiKeys] = useState({});
  const [useEnvKeys, setUseEnvKeys] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [judgeModel, setJudgeModel] = useState('claude-opus-4.6');
  const [outputs, setOutputs] = useState([]);
  // Per-model: 'api' or 'paste' — OpenEvidence defaults to 'paste', others to 'api'
  const [inputModes, setInputModes] = useState({
    'claude-opus-4.6': 'api',
    'gpt-5': 'api',
    'glm-5': 'api',
    'openevidence': 'paste',
  });
  // Per-model pasted text
  const [pastedOutputs, setPastedOutputs] = useState({
    'claude-opus-4.6': '',
    'gpt-5': '',
    'glm-5': '',
    'openevidence': '',
  });
  const [evaluation, setEvaluation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('outputs');
  const resultsRef = useRef(null);

  // Generate
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && selectedModels.every(m => inputModes[m] !== 'paste' || !pastedOutputs[m]?.trim())) return;
    setGenerating(true);
    setEvaluation(null);
    setActiveTab('outputs');

    try {
      // Separate models by input mode
      const apiModels = selectedModels.filter(m => inputModes[m] === 'api');
      const pasteModels = selectedModels.filter(m => inputModes[m] === 'paste');

      let results = [];

      // Generate via API for models in API mode
      if (apiModels.length > 0 && prompt.trim()) {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            models: apiModels,
            apiKeys,
            envKeys: useEnvKeys,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        results = [...data.results];
      }

      // Add pasted outputs for models in paste mode
      for (const modelId of pasteModels) {
        const text = pastedOutputs[modelId]?.trim();
        if (text) {
          results.push({ model: modelId, text, status: 'success' });
        }
      }

      setOutputs(results);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      console.error(err);
      alert('Generation error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  }, [prompt, selectedModels, apiKeys, useEnvKeys, inputModes, pastedOutputs]);

  // Evaluate
  const handleEvaluate = useCallback(async () => {
    const validOutputs = outputs.filter(o => o.status === 'success' && o.text);
    if (validOutputs.length < 1) return;

    setEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: prompt.trim(),
          outputs: validOutputs,
          judgeModel,
          apiKeys,
          envKeys: useEnvKeys,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setEvaluation(data.evaluation);
      setActiveTab('evaluation');
    } catch (err) {
      console.error(err);
      alert('Evaluation error: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  }, [outputs, prompt, judgeModel, apiKeys, useEnvKeys]);

  const validOutputCount = outputs.filter(o => o.status === 'success').length;

  return (
    <div className="app">
      {/* ─── HEADER ─── */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1>AppealBench</h1>
              <p className="tagline">LLM Insurance Appeal Comparator</p>
            </div>
          </div>
          <div className="header-meta">
            <span className="version-badge">v1.0</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* ─── API SETTINGS ─── */}
        <ApiKeyPanel
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          useEnvKeys={useEnvKeys}
          setUseEnvKeys={setUseEnvKeys}
          isOpen={settingsOpen}
          setIsOpen={setSettingsOpen}
        />

        {/* ─── PROMPT INPUT ─── */}
        <section className="prompt-section">
          <div className="prompt-header">
            <h2>Appeal Details</h2>
            <p className="prompt-hint">Include: patient info, diagnosis, denied service, denial reason, supporting evidence</p>
          </div>
          <textarea
            className="prompt-input"
            placeholder={`Example: Write an insurance appeal letter for a 62-year-old male with metastatic castration-resistant prostate cancer (mCRPC) who has been denied coverage for Lu-177 PSMA therapy (Pluvicto). The denial reason states "experimental/investigational." The patient has progressed through enzalutamide, abiraterone, and docetaxel. PSMA PET scan shows PSMA-avid metastatic disease. Include references to FDA approval, NCCN guidelines, and relevant clinical trials (VISION, TheraP).`}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={8}
          />

          <ModelSelector selectedModels={selectedModels} setSelectedModels={setSelectedModels} />

          {/* Per-model input cards (API vs Paste) */}
          {selectedModels.length > 0 && (
            <div className="model-input-cards">
              {selectedModels.map(modelId => {
                const model = MODELS.find(m => m.id === modelId);
                return (
                  <ModelInputCard
                    key={modelId}
                    model={model}
                    inputMode={inputModes[modelId]}
                    onToggleMode={(mode) => setInputModes(prev => ({ ...prev, [modelId]: mode }))}
                    pastedText={pastedOutputs[modelId] || ''}
                    onPasteChange={(text) => setPastedOutputs(prev => ({ ...prev, [modelId]: text }))}
                  />
                );
              })}
            </div>
          )}

          <div className="prompt-actions">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating || selectedModels.length === 0}
            >
              {generating ? <Spinner label="Generating..." /> : <><IconSend /> Generate &amp; Compare</>}
            </button>
          </div>
        </section>

        {/* ─── RESULTS ─── */}
        {outputs.length > 0 && (
          <section className="results-section" ref={resultsRef}>
            {/* Tab bar */}
            <div className="tab-bar">
              <button
                className={`tab ${activeTab === 'outputs' ? 'active' : ''}`}
                onClick={() => setActiveTab('outputs')}
              >
                Outputs ({outputs.length})
              </button>
              <button
                className={`tab ${activeTab === 'evaluation' ? 'active' : ''}`}
                onClick={() => setActiveTab('evaluation')}
                disabled={!evaluation}
              >
                Evaluation {evaluation && '✓'}
              </button>

              <div className="tab-spacer" />

              {/* Judge selector & evaluate button */}
              <div className="judge-controls">
                <label className="judge-label">Judge:</label>
                <select
                  className="judge-select"
                  value={judgeModel}
                  onChange={e => setJudgeModel(e.target.value)}
                >
                  {JUDGE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <button
                  className="btn btn-evaluate"
                  onClick={handleEvaluate}
                  disabled={evaluating || validOutputCount < 1}
                >
                  {evaluating ? <Spinner label="Evaluating..." /> : <><IconScale /> Evaluate</>}
                </button>
              </div>
            </div>

            {/* Outputs tab */}
            {activeTab === 'outputs' && (
              <div className="outputs-grid">
                {outputs.map((output, i) => (
                  <OutputCard
                    key={output.model + i}
                    model={output.model}
                    output={output}
                    expanded={expandedOutput === i}
                    onToggleExpand={() => setExpandedOutput(expandedOutput === i ? null : i)}
                  />
                ))}
              </div>
            )}

            {/* Evaluation tab */}
            {activeTab === 'evaluation' && evaluation && (
              <div className="evaluation-content">
                <div className="eval-top-row">
                  <OverallScoreChart evaluation={evaluation} />
                  <RadarComparison evaluation={evaluation} />
                </div>
                <MetricsTable evaluation={evaluation} />
                <RecommendationPanel evaluation={evaluation} />
              </div>
            )}
          </section>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="app-footer">
        <p>AppealBench — Open source LLM comparison for insurance appeals</p>
        <p className="footer-sub">Not legal or medical advice. Always consult qualified professionals.</p>
      </footer>
    </div>
  );
}
