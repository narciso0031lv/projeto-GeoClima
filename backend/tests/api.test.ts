import request from 'supertest';
import { app } from '../src/app.js';

describe('GeoClima API - Testes de Integração', () => {

    // Teste de Health Check (0,5 pontos)
    test('Deve retornar status 200 e "healthy" no endpoint de saúde', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
    });

    // Teste do Endpoint 1: Sucesso Clima (1,5 pontos)
    test('Deve retornar o clima de Fortaleza com sucesso', async () => {
        const response = await request(app).get('/api/v1/clima/Fortaleza');
        expect(response.status).toBe(200);
        expect(response.body.nome).toBe('Fortaleza');
        expect(response.body.clima).toHaveProperty('temperatura_max');
        expect(response.body.clima).toHaveProperty('unidades');
    }, 10000); // Timeout de 10s para APIs externas

    // Teste do Endpoint 1: Erro 400 - Nome Curto (0,25 pontos)
    test('Deve retornar erro 400 para nome de cidade com menos de 2 caracteres', async () => {
        const response = await request(app).get('/api/v1/clima/F');
        expect(response.status).toBe(400);
        expect(response.body.codigo).toBe('NOME_INVALIDO');
    });

    // Teste do Endpoint 2: Sucesso Cidades por Estado (1,75 pontos)
    test('Deve retornar uma lista de cidades ao informar a UF CE', async () => {
        const response = await request(app).get('/api/v1/cidades/CE?limite=5');
        expect(response.status).toBe(200);
        expect(response.body.uf).toBe('CE');
        expect(Array.isArray(response.body.cidades)).toBe(true);
        expect(response.body.cidades.length).toBeLessThanOrEqual(5);
    }, 15000); // Timeout maior (15s) pois a lista de municípios pode ser lenta

    // Teste do Endpoint 2: Erro 404 - UF não encontrada (0,5 pontos)
    test('Deve retornar erro 404 para uma sigla de UF que não existe', async () => {
        const response = await request(app).get('/api/v1/cidades/ZZ');
        expect(response.status).toBe(404);
        expect(response.body.codigo).toBe('UF_NAO_ENCONTRADA');
    });
});