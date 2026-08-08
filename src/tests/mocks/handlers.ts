import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock ViaCEP API para simulação de frete com falhas de rede
  http.get('https://viacep.com.br/ws/:cep/json/', ({ params }) => {
    const { cep } = params
    if (cep === '00000000') {
      return new HttpResponse(null, { status: 500 })
    }
    if (cep === '99999999') {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    })
  }),
]
