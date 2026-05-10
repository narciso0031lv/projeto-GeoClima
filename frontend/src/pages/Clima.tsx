import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Sun, CloudRain, MapPin, ArrowLeft, Cloud } from 'lucide-react';


interface WeatherData {
    nome: string;
    estado: string;
    clima: {
        temperatura_min: number;
        temperatura_max: number;
        condicao: string;
    };
}

export default function Clima() {
    const { cidade } = useParams<{ cidade: string }>();
    const navigate = useNavigate();


    const [dados, setDados] = useState<WeatherData | null>(null);
    const [erro, setErro] = useState('');

    const buscarDados = useCallback(async () => {
        if (!cidade) return;

        try {
            const response = await axios.get(`http://localhost:3000/api/v1/clima/${cidade}`);
            setDados(response.data);
        } catch (err) {
            const axiosError = err as AxiosError<{ mensagem: string }>;
            setErro(axiosError.response?.data?.mensagem || 'Erro ao carregar');
        }
    }, [cidade]);


    useEffect(() => {
        let montado = true;

        const inicializar = async () => {
            if (montado) {
                await buscarDados();
            }
        };

        inicializar();

        return () => {
            montado = false;
        };
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
                <button
                    onClick={() => navigate('/')}
                    className="search-box"
                    style={{ width: 'fit-content', padding: '8px 15px', marginBottom: '20px', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={18} /> Voltar
                </button>

                {erro && <p className="error-msg">{erro}</p>}

                {dados && (
                    <div className="fade-in">
                        <div className="location">
                            <MapPin size={16} />
                            <span>{dados.nome}, {dados.estado}</span>
                        </div>

                        <div className="temp-display">
                            {dados.clima.condicao.toLowerCase().includes('chuva') ?
                                <CloudRain size={80} color="white" /> :
                                dados.clima.condicao.toLowerCase().includes('nublado') ?
                                    <Cloud size={80} color="white" /> :
                                    <Sun size={80} color="white" />
                            }
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