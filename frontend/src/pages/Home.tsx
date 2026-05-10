import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
    const [cidade, setCidade] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (cidade.trim()) {
            navigate(`/clima/${cidade}`);
        }
    };

    return (
        <div className="app-container tema-padrao">
            <div className="weather-card fade-in">
                <h1>GeoClima</h1>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Descubra o clima em qualquer cidade</p>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Ex: Fortaleza..."
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} title="Pesquisar">
                        <Search size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}