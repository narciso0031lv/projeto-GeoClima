import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Sun, CloudRain, MapPin, ArrowLeft, Cloud, Wind, Droplets, Thermometer, AlertCircle } from 'lucide-react';

interface WeatherData {
  nome: string;
  estado: string;
  clima: {
    temperatura_min: number;
    temperatura_max: number;
    condicao: string;
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
    const CACHE_KEY = `clima_${cidade}`;
    const CACHE_TIME = 10 * 60 * 1000; 

    try {
      setCarregando(true);

      // 1. Verificar se existe cache válido
      const cacheSalvo = localStorage.getItem(CACHE_KEY);
      if (cacheSalvo) {
        const { data, timestamp } = JSON.parse(cacheSalvo);
        const isValido = Date.now() - timestamp < CACHE_TIME;

        if (isValido) {
          setDados(data);
          setCarregando(false);
          return; // Retorna cedo, sem fazer o fetch
        }
      }

      // 2. Se não houver cache ou estiver expirado, faz a requisição
      const response = await axios.get(`http://localhost:3000/api/v1/clima/${cidade}`);

      // 3. Salva no cache com o timestamp atual
      const objetoCache = {
        data: response.data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(objetoCache));

      setDados(response.data);
      setErro('');
    } catch (err) {
      const axiosError = err as AxiosError<{ mensagem: string }>;
      setErro(axiosError.response?.data?.mensagem || 'Erro ao buscar dados');
    } finally {
      setCarregando(false);
    }
  }, [cidade]);

  useEffect(() => {
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

        <button onClick={() => navigate('/')} className="back-link">
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>

        {carregando && (
          <div className="weather-details">
            <header className="location-header">
              <div className="skeleton-base sk-title"></div>
            </header>

            <section className="main-info">
              <div className="skeleton-base sk-icon"></div>
              <div className="temp-main">
                <div className="skeleton-base sk-temp"></div>
                <div className="skeleton-base sk-text" style={{ marginTop: '10px' }}></div>
              </div>
            </section>

            <footer className="details-grid">
              <div className="skeleton-base sk-item"></div>
              <div className="skeleton-base sk-item"></div>
              <div className="skeleton-base sk-item"></div>
              <div className="skeleton-base sk-item"></div>
            </footer>
          </div>
        )}

        {erro && (
          <div className="error-container">
            <div className="error-icon">
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>

            <p className="error-message">
              {erro === 'Cidade não encontrada ou erro no servidor'
                ? 'Ops! Não conseguimos encontrar essa cidade.'
                : erro}
            </p>

            <button onClick={() => navigate('/')} className="btn-retry">
              Tentar outra cidade
            </button>
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