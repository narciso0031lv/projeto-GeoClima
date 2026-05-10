import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Sun, CloudRain, MapPin, ArrowLeft, Cloud, Wind, Droplets, Thermometer } from 'lucide-react';

// Interface para garantir tipagem forte (Essencial para ADS)
interface WeatherData {
  nome: string;
  estado: string;
  clima: {
    temperatura_min: number;
    temperatura_max: number;
    condicao: string;
    // Campos opcionais caso o backend já os envie
    sensacao?: number;
    humidade?: number;
    vento?: number;
  };
}

export default function Clima() {
  const { cidade } = useParams<{ cidade: string }>();
  const navigate = useNavigate();
  
  const [dados, setDados] = useState<WeatherData | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  

  const buscarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`http://localhost:3000/api/v1/clima/${cidade}`);
      setDados(response.data);
      setErro('');
    } catch (err) {
      const axiosError = err as AxiosError<{ mensagem: string }>;
      setErro(axiosError.response?.data?.mensagem || 'Cidade não encontrada ou erro no servidor');
    } finally {
      setCarregando(false);
    }
  }, [cidade]);

  useEffect(() => {
  // Criamos uma função interna para disparar a busca
  const inicializar = async () => {
    await buscarDados();
  };

  inicializar();
}, [buscarDados]);

  const obterTemaClima = () => {
    if (!dados) return 'tema-padrao';
    const condicao = dados.clima.condicao.toLowerCase();
    if (condicao.includes('chuva')) return 'tema-chuvoso';
    if (condicao.includes('nublado')) return 'tema-nublado';
    return 'tema-ensolarado';
  };

  return (
    <div className={`app-container ${obterTemaClima()}`}>
      <div className="weather-card fade-in">
        
        {/* Botão de Voltar Minimalista */}
        <button onClick={() => navigate('/')} className="back-link">
          <ArrowLeft size={18} />
          <span>Voltar para a busca</span>
        </button>

        {carregando && <div className="loader">Carregando clima...</div>}

        {erro && (
          <div className="error-container">
            <p>{erro}</p>
            <button onClick={() => navigate('/')}>Tentar outra cidade</button>
          </div>
        )}

        {dados && !carregando && (
          <div className="weather-details">
            <header className="location-header">
              <MapPin size={20} />
              <h1>{dados.nome}, {dados.estado}</h1>
            </header>
            
            <section className="main-info">
              <div className="weather-icon-large">
                {dados.clima.condicao.toLowerCase().includes('chuva') ? 
                  <CloudRain size={100} /> : 
                  dados.clima.condicao.toLowerCase().includes('nublado') ?
                  <Cloud size={100} /> :
                  <Sun size={100} />
                }
              </div>
              <div className="temp-main">
                <span className="current-temp">{dados.clima.temperatura_max}°</span>
                <p className="condition-text">{dados.clima.condicao}</p>
              </div>
            </section>

            {/* Grid de Detalhes Adicionais (O que você sugeriu) */}
            <footer className="details-grid">
              <div className="detail-item">
                <Thermometer size={18} />
                <div>
                  <p className="label">Mínima</p>
                  <p className="value">{dados.clima.temperatura_min}°C</p>
                </div>
              </div>
              <div className="detail-item">
                <Thermometer size={18} />
                <div>
                  <p className="label">Máxima</p>
                  <p className="value">{dados.clima.temperatura_max}°C</p>
                </div>
              </div>
              
              {/* Exibe Humidade e Vento se existirem no retorno da API */}
              {dados.clima.humidade && (
                <div className="detail-item">
                  <Droplets size={18} />
                  <div>
                    <p className="label">Umidade</p>
                    <p className="value">{dados.clima.humidade}%</p>
                  </div>
                </div>
              )}
              
              {dados.clima.vento && (
                <div className="detail-item">
                  <Wind size={18} />
                  <div>
                    <p className="label">Vento</p>
                    <p className="value">{dados.clima.vento} km/h</p>
                  </div>
                </div>
              )}
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}