import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Traduzir códigos da Open-Meteo
function traduzirClima(code: number): string {
  const mapeamento: { [key: number]: string } = {
    0: 'Céu Limpo',
    1: 'Predominantemente Limpo', 2: 'Parcialmente Nublado', 3: 'Nublado',
    45: 'Nevoeiro', 48: 'Nevoeiro com Geada',
    51: 'Drizzle Leve', 53: 'Drizzle Moderado', 55: 'Drizzle Denso',
    61: 'Chuva Leve', 63: 'Chuva Moderada', 65: 'Chuva Forte',
    80: 'Pancadas de Chuva Leves', 81: 'Pancadas de Chuva Moderadas', 82: 'Pancadas de Chuva Violentas',
    95: 'Trovoada Leve', 96: 'Trovoada com Granizo',
  };
  return mapeamento[code] || 'Nublado';
}

// --- ENDPOINT 1: CLIMA DETALHADO ---
app.get('/api/v1/clima/:cidade', async (req: Request, res: Response) => {
  const cidade = req.params.cidade as string;

  if (!cidade || cidade.length < 2) {
    return res.status(400).json({
      erro: true,
      codigo: "NOME_INVALIDO",
      mensagem: "O nome da cidade deve conter pelo menos 2 caracteres",
      nome_informado: cidade
    });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
    const { data: geoData } = await axios.get(geoUrl);

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({
        erro: true,
        codigo: "CIDADE_NAO_ENCONTRADA",
        mensagem: "Nenhuma cidade encontrada com o nome informado",
        nome_informado: cidade
      });
    }

    const { latitude, longitude, name, admin1 } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const { data: weatherData } = await axios.get(weatherUrl);

    res.status(200).json({
      nome: name,
      estado: admin1 || "S/N",
      clima: {
        temperatura_min: Math.round(weatherData.daily.temperature_2m_min[0]),
        temperatura_max: Math.round(weatherData.daily.temperature_2m_max[0]),
        condicao: traduzirClima(weatherData.current.weather_code),
        sensacao: Math.round(weatherData.current.apparent_temperature),
        humidade: weatherData.current.relative_humidity_2m,
        vento: Math.round(weatherData.current.wind_speed_10m),
        unidades: { temperatura: "°C" }
      },
      consultado_em: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({ 
      erro: true, 
      codigo: "SERVICO_EXTERNO_INDISPONIVEL", 
      mensagem: "Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes",
      servico: "Open-Meteo"
    });
  }
});

// --- ENDPOINT 2: LISTAGEM DE CIDADES (Versão Corrigida) ---
app.get('/api/v1/cidades/:sigla_uf', async (req: Request, res: Response) => {
  const sigla_uf = (req.params.sigla_uf as string).toUpperCase();
  const limite = parseInt(req.query.limite as string) || 10;

  if (!sigla_uf || sigla_uf.length !== 2) {
    return res.status(400).json({
      erro: true,
      codigo: "SIGLA_UF_INVALIDA",
      mensagem: "A sigla do estado deve conter exatamente 2 letras",
      sigla_uf_informada: sigla_uf
    });
  }

  try {
    const urlIBGE = `https://brasilapi.com.br/api/ibge/municipios/v1/${sigla_uf}`;
    
    const response = await axios.get(urlIBGE, { timeout: 10000 });
    const cidades = response.data;

    const limiteReal = Math.min(Math.max(limite, 1), 100);
    const cidadesFiltradas = cidades.slice(0, limiteReal).map((c: any) => ({ 
      nome: c.nome 
    }));

    res.status(200).json({
      uf: sigla_uf,
      quantidade_retornada: cidadesFiltradas.length,
      cidades: cidadesFiltradas,
      consultado_em: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(404).json({ 
      erro: true, 
      codigo: "UF_NAO_ENCONTRADA", 
      mensagem: "Estado com a sigla informada não foi encontrado",
      sigla_uf_informada: sigla_uf 
    });
  }
});

// --- ENDPOINT 3: HEALTH CHECK ---
app.get('/api/v1/health', async (req: Request, res: Response) => {
  const versao = "1.0.0";
  const timestamp = new Date().toISOString();

  try {
    await axios.get('https://geocoding-api.open-meteo.com/v1/search?name=Fortaleza&count=1', { timeout: 2000 });

    // REQUISITO: Sucesso - HTTP 200 (Healthy)
    res.status(200).json({
      status: "healthy",
      versao: versao,
      timestamp: timestamp
    });
  } catch (error) {
    // REQUISITO: Serviço degradado - HTTP 200 (Degraded)
    res.status(200).json({
      status: "degraded",
      versao: versao,
      timestamp: timestamp,
      motivo: "Serviço externo indisponível"
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`rodando em http://localhost:${PORT}`);
});

export { app };