export interface PastEdition {
  year: string;
  name: string;
  pieces: number;
  description: string;
  accent: string;
}

export const EDITION_HISTORY: PastEdition[] = [
  {
    year: '2026',
    name: 'Coleção Eclipse',
    pieces: 50,
    description: 'Eclipse solar em detalhes premium. A edição que abriu a temporada com numeração gravada em laser.',
    accent: '#FF0082',
  },
  {
    year: '2026',
    name: 'Supernova Drop',
    pieces: 30,
    description: 'Hoodie explosivo com forro polar. Esgotou em 48h e virou lenda entre a tripulação.',
    accent: '#7B2FBE',
  },
  {
    year: '2025',
    name: 'Alien Voyager',
    pieces: 100,
    description: 'Primeira edição numerada com alienígena estilizado. A que começou tudo.',
    accent: '#FF3399',
  },
  {
    year: '2025',
    name: 'Nebulosa Collection',
    pieces: 80,
    description: 'Estampas psicodélicas inspiradas em nebulosas reais capturadas pelo telescópio.',
    accent: '#4A0E4E',
  },
  {
    year: '2024',
    name: 'Primeira Órbita',
    pieces: 120,
    description: 'Edição inaugural da marca. Base da comunidade que hoje compõe o Cofre de Membro.',
    accent: '#16213E',
  },
];
