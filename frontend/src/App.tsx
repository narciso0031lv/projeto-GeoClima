import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Sun, CloudRain, MapPin, Search, Cloud } from 'lucide-react';
import './App.css';

interface WeatherData {
  nome: string;
  estado: string;
  clima: {
    temperatura_min: number;
    temperatura_max: number;
    condicao: string;
  };
}

function App() {
  const [cidade, setCidade] = useState('Fortaleza');
  const [dados, setDados] = useState<WeatherData | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função para definir o tema baseado na condição vinda do backend
  const obterTemaClima = () => {
    if (!dados) return 'tema-padrao';
    const condicao = dados.clima.condicao.toLowerCase();
    
    if (condicao.includes('chuva') || condicao.includes('tempestade')) return 'tema-chuvoso';
    if (condicao.includes('nublado') || condicao.includes('encoberto')) return 'tema-nublado';
    if (condicao.includes('sol') || condicao.includes('limpo') || condicao.includes('claro')) return 'tema-ensolarado';
    
    return 'tema-padrao';
  };

  const buscarClima = useCallback(async () => {
    if (!cidade.trim()) return;
    
    setCarregando(true);
    setErro('');
    
    try {
      // Conexão com seu backend na porta 3000
      const response = await axios.get(`http://localhost:3000/api/v1/clima/${cidade}`);
      setDados(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ mensagem: string }>;
      setErro(axiosError.response?.data?.mensagem || 'Serviço indisponível');
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [cidade]);

  useEffect(() => {
    const inicializar = async () => {
      await buscarClima();
    };
    inicializar();
  }, [buscarClima]); 

  return (
    <div className={`app-container ${obterTemaClima()}`}>
      <div className="weather-card">
        <h1>GeoClima</h1>
        
        <div className="search-box">
          <input 
            type="text" 
            value={cidade} 
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Buscar cidade..."
            onKeyDown={(e) => e.key === 'Enter' && buscarClima()}
          />
          <button onClick={buscarClima} disabled={carregando} title="Pesquisar">
            <Search size={20} />
          </button>
        </div>

        {erro && <div className="error-msg">{erro}</div>}

        {dados && (
          <div className="fade-in">
            <div className="location">
              <MapPin size={16} />
              <span>{dados.nome}, {dados.estado}</span>
            </div>
            
            <div className="temp-display">
              {/* Ícones dinâmicos */}
              {dados.clima.condicao.toLowerCase().includes('chuva') ? (
                <CloudRain size={80} color="white" className="weather-icon-main" />
              ) : dados.clima.condicao.toLowerCase().includes('nublado') ? (
                <Cloud size={80} color="white" className="weather-icon-main" />
              ) : (
                <Sun size={80} color="white" className="weather-icon-main" />
              )}
              
              <p className="temp-value">{dados.clima.temperatura_max}°C</p>
              <p className="condition">{dados.clima.condicao}</p>
            </div>

            <div className="stats">
              <div className="stat-item">
                <p className="stat-label">Mínima</p>
                <p className="stat-val">{dados.clima.temperatura_min}°C</p>
              </div>
              <div className="stat-item">
                <p className="stat-label">Máxima</p>
                <p className="stat-val">{dados.clima.temperatura_max}°C</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;