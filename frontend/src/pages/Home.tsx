import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';

export default function Home() {
  const [cidade, setCidade] = useState('');
  const navigate = useNavigate();

 
  const cidadesSugestao = [
    'Fortaleza', 'São Paulo', 'Rio de Janeiro', 'Curitiba', 
    'Salvador', 'Brasília', 'Belo Horizonte', 'Manaus',
  ];

  const handleSearch = () => {
    if (cidade.trim()) navigate(`/clima/${cidade}`);
  };

  return (
    <div className="app-container tema-padrao">
      <div className="home-content fade-in">
        
        
        <header className="hero-section">
          <h1>GeoClima</h1>
          <p>Descubra o tempo em tempo real com precisão</p>
          
          <div className="search-box-large">
            <input 
              type="text" 
              placeholder="Pesquise por uma cidade..." 
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn-main">
              <Search size={24} />
              <span>Buscar</span>
            </button>
          </div>
        </header>

        <section className="suggestions-section">
          <h2>Cidades Populares</h2>
          <div className="cities-grid">
            {cidadesSugestao.map((item) => (
              <div 
                key={item} 
                className="city-card"
                onClick={() => navigate(`/clima/${item}`)}
              >
                <div className="city-info">
                  <MapPin size={14} />
                  <span>{item}</span>
                </div>
                <ArrowRight size={18} className="arrow-icon" />
              </div>
            ))}
          </div>
        </section>
        
      </div>
    </div>
  );
}