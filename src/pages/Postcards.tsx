import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Postcards() {
  const [postcards, setPostcards] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tag, setTag] = useState('Poupança');
  const [loading, setLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<{id: number, text: string, sender: 'user' | 'bot'}[]>([
    { id: 1, text: 'Olá, tens alguma dúvida financeira?', sender: 'bot' }
  ]);
  const [chatInput, setChatInput] = useState('');

  function handleClearChat() {
    setChatMessages([{ id: Date.now(), text: 'Olá, tens alguma dúvida financeira?', sender: 'bot' }]);
  }

  function handleChatSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { id: Date.now(), text: chatInput, sender: 'user' as const };
    setChatMessages(prev => [...prev, newMsg]);
    const lowerInput = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let response = "Interessante. Podes dar-me mais detalhes para te aconselhar melhor?";

      if (lowerInput.includes('ola') || lowerInput.includes('olá') || lowerInput.includes('bom')) {
        response = "Olá! Sou o teu assistente financeiro. Pergunta-me sobre poupança, investimento ou dívidas.";
      } else if (lowerInput.includes('poupanca') || lowerInput.includes('poupança') || lowerInput.includes('poupar')) {
        response = "Uma regra popular é a 50/30/20: 50% necessidades, 30% desejos e 20% poupança. Experimenta!";
      } else if (lowerInput.includes('investimento') || lowerInput.includes('investir')) {
        response = "Lembra-te: a maior risco, maior potencial de retorno, mas nunca invistas dinheiro que precises a curto prazo.";
      } else if (lowerInput.includes('divida') || lowerInput.includes('dívida') || lowerInput.includes('emprestimo') || lowerInput.includes('empréstimo')) {
        response = "Prioriza pagar as dívidas com maior taxa de juro primeiro (método avalanche) para poupar dinheiro a longo prazo.";
      } else if (lowerInput.includes('orcamento') || lowerInput.includes('orçamento') || lowerInput.includes('gasto') || lowerInput.includes('despesa')) {
        response = "Manter um registo diário das tuas despesas é o primeiro passo para assumir o controlo das tuas finanças.";
      } else {
        const randomTips = [
          "Os juros compostos são a oitava maravilha do mundo. Começa cedo!",
          "Um fundo de emergência deve cobrir de 3 a 6 meses das tuas despesas fixas.",
          "Evita a inflação do estilo de vida: se ganhares mais, tenta não gastar mais automaticamente.",
          "Investe em ti mesmo: a educação financeira paga os melhores dividendos."
        ];
        response = randomTips[Math.floor(Math.random() * randomTips.length)];
      }

      setChatMessages(prev => [...prev, { id: Date.now(), text: response, sender: 'bot' }]);
    }, 1000);
  }

  useEffect(() => {
    let mounted = true;
    api.getPostcards().then(p => { if (mounted) setPostcards(p); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await api.addPostcard({ title, text, tag });
      setPostcards(p => [created, ...p]);
      setTitle(''); setText(''); setTag('Poupança');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Conselhos</h1>
        <p className="muted">Cria e gere conselhos financeiros que podes anexar ao relatório partilhado.</p>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Os teus Conselhos</h3>
            <span className="muted" style={{ fontSize: '0.9rem' }}>{postcards.length} conselhos</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {postcards.map(p => (
              <div key={p.id} style={{ 
                padding: 20, 
                background: '#fff', 
                borderRadius: 12, 
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                border: '1px solid #f0f0f0',
                display: 'flex', 
                flexDirection: 'column',
                gap: 12,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#111827' }}>{p.title}</strong>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#047857', 
                    background: '#ecfdf5', 
                    padding: '4px 10px', 
                    borderRadius: 999,
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>{p.tag}</span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>{p.text}</div>
              </div>
            ))}
            {postcards.length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#9ca3af', 
                background: '#f9fafb', 
                borderRadius: 12, 
                border: '2px dashed #e5e7eb' 
              }}>
                <p>Ainda não há conselhos.</p>
                <p style={{ fontSize: '0.9rem' }}>Utiliza o formulário para criar o primeiro!</p>
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f3f4f6' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.1rem', color: '#111827' }}>Novo conselho</h3>
            <form onSubmit={handleAdd} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: 6 }}>Título</label>
                <input 
                  placeholder="Ex: Poupar na alimentação" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: 6 }}>Conteúdo</label>
                <textarea 
                  placeholder="Descreve o conselho..." 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: 6 }}>Categoria</label>
                <select 
                  value={tag} 
                  onChange={(e) => setTag(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', background: '#fff' }}
                >
                  <option>Poupança</option>
                  <option>Investimento</option>
                  <option>Orçamento</option>
                  <option>Compras</option>
                </select>
              </div>
              <button className="btn primary" type="submit" disabled={loading} style={{ marginTop: 8, justifyContent: 'center', padding: '10px' }}>
                {loading ? 'A guardar...' : 'Criar Conselho'}
              </button>
            </form>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)', border: '1px solid #f3f4f6', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 450 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span> Assistente IA
              </h3>
              <button onClick={handleClearChat} className="btn small" style={{ fontSize: '0.75rem', padding: '4px 8px', height: 'auto' }}>Limpar</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#fff' }}>
                {chatMessages.map(m => (
                  <div key={m.id} style={{ 
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user' ? '#064e3b' : '#f3f4f6',
                    color: m.sender === 'user' ? '#fff' : '#1f2937',
                    padding: '10px 16px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    maxWidth: '85%',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {m.text}
                  </div>
                ))}
              </div>
            
            <form onSubmit={handleChatSend} style={{ padding: 12, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, background: '#fff' }}>
                <input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                placeholder="Pergunta sobre finanças..." 
                style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: '1px solid #e5e7eb', fontSize: '0.9rem', outline: 'none', background: '#f9fafb' }}
                />
              <button type="submit" className="btn" style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#064e3b', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
              </form>
            </div>
        </aside>
      </section>
    </main>
  );
}
