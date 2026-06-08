export const FIRST_NAMES = [
  'Ana', 'Bruno', 'Camila', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Paulo',
  'Rafaela', 'Samuel', 'Tatiana', 'Vinícius', 'Amanda', 'Caio', 'Daniela', 'Eduardo',
  'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Juliana', 'Kleber', 'Larissa', 'Marcos',
  'Natália', 'Otávio', 'Patrícia', 'Ricardo', 'Sabrina', 'Thiago', 'Úrsula', 'Victor',
  'Wesley', 'Yasmin', 'Zélia', 'Adriano', 'Bianca', 'César', 'Débora', 'Elisa',
  'Fabiano', 'Gisele',
] as const

export const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Araújo', 'Melo',
  'Barbosa', 'Rocha', 'Dias', 'Nunes', 'Mendes', 'Freitas', 'Teixeira', 'Campos',
  'Moura', 'Cardoso', 'Correia', 'Cavalcanti', 'Monteiro', 'Pires', 'Vieira', 'Lopes',
  'Moreira', 'Castro', 'Fernandes', 'Duarte', 'Machado', 'Ramos', 'Reis', 'Nascimento',
  'Andrade', 'Batista', 'Farias', 'Peixoto', 'Miranda', 'Assis', 'Borges', 'Cunha',
  'Macedo', 'Santana',
] as const

export interface SeedCity {
  city: string
  state: string
  ddd: string
}

/** Top 15 IBGE municipalities by population + Pelotas-RS */
export const IBGE_MAJOR_CITIES: SeedCity[] = [
  { city: 'São Paulo', state: 'SP', ddd: '11' },
  { city: 'Rio de Janeiro', state: 'RJ', ddd: '21' },
  { city: 'Brasília', state: 'DF', ddd: '61' },
  { city: 'Fortaleza', state: 'CE', ddd: '85' },
  { city: 'Salvador', state: 'BA', ddd: '71' },
  { city: 'Belo Horizonte', state: 'MG', ddd: '31' },
  { city: 'Manaus', state: 'AM', ddd: '92' },
  { city: 'Curitiba', state: 'PR', ddd: '41' },
  { city: 'Recife', state: 'PE', ddd: '81' },
  { city: 'Goiânia', state: 'GO', ddd: '62' },
  { city: 'Belém', state: 'PA', ddd: '91' },
  { city: 'Porto Alegre', state: 'RS', ddd: '51' },
  { city: 'Guarulhos', state: 'SP', ddd: '11' },
  { city: 'Campinas', state: 'SP', ddd: '19' },
  { city: 'São Luís', state: 'MA', ddd: '98' },
  { city: 'Pelotas', state: 'RS', ddd: '53' },
]

export function pickBrazilianName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]!
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]!
  return `${first} ${last}`
}

export function pickCity(index: number): SeedCity {
  return IBGE_MAJOR_CITIES[index % IBGE_MAJOR_CITIES.length]!
}

/** ~65% of trainers have a public contact phone with DDD matching their city */
export function pickContactPhone(index: number, location: SeedCity): string | undefined {
  if (index % 20 >= 13) {
    return undefined
  }

  const suffix = String(10000000 + index * 7654321).slice(-8)
  return `${location.ddd}9${suffix}`
}
