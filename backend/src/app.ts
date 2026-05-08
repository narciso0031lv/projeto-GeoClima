import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Checagem da API 
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: "healthy",
        projeto: "GeoClima",
        timestamp: new Date().toISOString()
    });
});

// Endpoint principal pra pegar o clima de uma cidade específica
app.get('/api/v1/clima/:cidade', async (req: Request, res: Response) => {
    const { cidade } = req.params;

    // Se o nome for muito curto nem adianta mandar pra API
    if (!cidade || cidade.length < 2) {
        return res.status(400).json({
            erro: true,
            codigo: "NOME_INVALIDO",
            mensagem: "O nome da cidade deve ter pelo menos 2 caracteres"
        });
    }

    try {
        // Primeiro busco o código da cidade na BrasilAPI
        const { data: buscaCidade } = await axios.get(
            `https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(String(cidade))}`,
            { timeout: 10000 } // timeout de 10s pra não travar a requisição
        );

        if (!buscaCidade || buscaCidade.length === 0) {
            throw new Error('NOT_FOUND');
        }

        const cidadeId = buscaCidade[0].id;

        // Com o ID na mão, busco a previsão atualizada
        const { data: climaData } = await axios.get(
            `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${cidadeId}`,
            { timeout: 10000 }
        );

        // Formato os dados pra mandar pro frontend de um jeito mais limpo
        res.status(200).json({
            nome: climaData.cidade,
            estado: climaData.estado,
            atualizado_em: climaData.atualizado_em,
            clima: {
                temperatura_min: climaData.clima[0].min,
                temperatura_max: climaData.clima[0].max,
                condicao: climaData.clima[0].condicao_desc,
                unidades: { temperatura: "Celsius" }
            }
        });

    } catch (error: any) {
        // Tratamento se a cidade não existir
        if (error.message === 'NOT_FOUND' || (error.response && error.response.status === 404)) {
            return res.status(404).json({
                erro: true,
                codigo: "CIDADE_NAO_ENCONTRADA",
                mensagem: "A cidade informada não foi localizada na base de dados climáticos"
            });
        }
        // Tratamento genérico se o serviço externo cair ou demorar muito
        res.status(503).json({
            erro: true,
            codigo: "SERVICO_EXTERNO_INDISPONIVEL",
            mensagem: "Não foi possível obter os dados da BrasilAPI no momento"
        });
    }
});

// Endpoint pra listar cidades de um estado (UF)
app.get('/api/v1/cidades/:sigla_uf', async (req: Request, res: Response) => {
    const { sigla_uf } = req.params;
    const limite = parseInt(req.query.limite as string) || 10;

    // Validação básica da sigla (sempre 2 letras)
    if (!sigla_uf || sigla_uf.length !== 2) {
        return res.status(400).json({
            erro: true,
            codigo: "SIGLA_UF_INVALIDA",
            mensagem: "A sigla do estado deve conter exatamente 2 letras"
        });
    }

    try {
        const { data: cidades } = await axios.get(
            `https://brasilapi.com.br/api/ibge/municipios/v1/${sigla_uf}?providers=dados-abertos-br`,
            { timeout: 15000 } // 15s aqui porque essa lista costuma ser mais pesada
        );

        // Garantindo que o limite seja entre 1 e 100
        const limiteReal = Math.min(Math.max(limite, 1), 100);
        const cidadesFiltradas = cidades.slice(0, limiteReal).map((c: any) => ({ nome: c.nome }));

        res.status(200).json({
            uf: String(sigla_uf).toUpperCase(),
            quantidade_retornada: cidadesFiltradas.length,
            cidades: cidadesFiltradas,
            consultado_em: new Date().toISOString()
        });
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                erro: true,
                codigo: "UF_NAO_ENCONTRADA",
                mensagem: "Estado não encontrado"
            });
        }
        res.status(503).json({
            erro: true,
            codigo: "SERVICO_EXTERNO_INDISPONIVEL",
            mensagem: "Erro ao listar cidades"
        });
    }
});

const PORT = 3000;

// Só sobe o servidor se não estiver rodando teste (pra evitar erro de porta ocupada no Jest)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Rodando em http://localhost:${PORT}`);
    });
}

export { app };