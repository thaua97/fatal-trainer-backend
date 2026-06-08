export const FIRST_NAMES = [
  'Ana', 'Bruno', 'Camila', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Paulo',
  'Rafaela', 'Samuel', 'Tatiana', 'Vinícius', 'Amanda', 'Caio', 'Daniela', 'Eduardo',
  'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Juliana', 'Kleber', 'Larissa', 'Marcos',
  'Natália', 'Otávio', 'Patrícia', 'Ricardo', 'Sabrina', 'Thiago', 'Úrsula', 'Victor',
  'Wesley', 'Yasmin', 'Zélia', 'Adriano', 'Bianca', 'César', 'Débora', 'Elisa',
  'Fabiano', 'Gisele',
  'Rogério', 'Cláudia', 'Maurício', 'Renata', 'André', 'Carolina', 'Fábio', 'Letícia',
  'Rodrigo', 'Simone', 'Alexandre', 'Vanessa', 'Leonardo', 'Priscila', 'Márcio', 'Aline',
  'Jéssica', 'Rafael', 'Cristina', 'Daniel', 'Mônica', 'Guilherme', 'Sandra', 'Roberto',
  'Luciana', 'Antônio', 'Carla', 'Pedro', 'Beatriz', 'José', 'Lívia', 'Francisco',
  'Milena', 'Alberto', 'Tânia', 'Sérgio', 'Viviane', 'Hugo', 'Regina', 'Miguel',
  'Silvia', 'Emanuel', 'Lorena', 'Ivan', 'Noemi', 'Cristiano', 'Diana', 'Jorge',
] as const

export const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Araújo', 'Melo',
  'Barbosa', 'Rocha', 'Dias', 'Nunes', 'Mendes', 'Freitas', 'Teixeira', 'Campos',
  'Moura', 'Cardoso', 'Correia', 'Cavalcanti', 'Monteiro', 'Pires', 'Vieira', 'Lopes',
  'Moreira', 'Castro', 'Fernandes', 'Duarte', 'Machado', 'Ramos', 'Reis', 'Nascimento',
  'Andrade', 'Batista', 'Farias', 'Peixoto', 'Miranda', 'Assis', 'Borges', 'Cunha',
  'Macedo', 'Santana',
  'Xavier', 'Pacheco', 'Aguiar', 'Fonseca', 'Moraes', 'Coelho', 'Viana', 'Barros',
  'Neves', 'Cordeiro', 'Guimarães', 'Tavares', 'Braga', 'Siqueira', 'Mota', 'Leite',
  'Figueiredo', 'Magalhães', 'Azevedo', 'Pinto', 'Marques', 'Cruz', 'Nogueira', 'Vargas',
  'Bezerra', 'Medeiros', 'Sá', 'Lacerda', 'Paiva', 'Queiroz', 'Amaral', 'Brito',
  'Dantas', 'Esteves', 'Furtado', 'Garcia', 'Henriques', 'Inácio', 'Jardim', 'Vilela',
  'Klein', 'Lemos', 'Matos', 'Noronha', 'Ornelas', 'Pimentel', 'Quintana', 'Rangel',
] as const

export interface SeedCity {
  city: string
  state: string
  ddd: string
}

/** Major IBGE municipalities across all Brazilian regions */
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
  { city: 'Macapá', state: 'AP', ddd: '96' },
  { city: 'Rio Branco', state: 'AC', ddd: '68' },
  { city: 'Boa Vista', state: 'RR', ddd: '95' },
  { city: 'Natal', state: 'RN', ddd: '84' },
  { city: 'João Pessoa', state: 'PB', ddd: '83' },
  { city: 'Maceió', state: 'AL', ddd: '82' },
  { city: 'Teresina', state: 'PI', ddd: '86' },
  { city: 'Aracaju', state: 'SE', ddd: '79' },
  { city: 'Feira de Santana', state: 'BA', ddd: '75' },
  { city: 'Cuiabá', state: 'MT', ddd: '65' },
  { city: 'Campo Grande', state: 'MS', ddd: '67' },
  { city: 'Dourados', state: 'MS', ddd: '67' },
  { city: 'Florianópolis', state: 'SC', ddd: '48' },
  { city: 'Niterói', state: 'RJ', ddd: '21' },
  { city: 'Santos', state: 'SP', ddd: '13' },
  { city: 'Ribeirão Preto', state: 'SP', ddd: '16' },
  { city: 'Sorocaba', state: 'SP', ddd: '15' },
  { city: 'Juiz de Fora', state: 'MG', ddd: '32' },
  { city: 'Joinville', state: 'SC', ddd: '47' },
  { city: 'Londrina', state: 'PR', ddd: '43' },
  { city: 'Caxias do Sul', state: 'RS', ddd: '54' },
  { city: 'Blumenau', state: 'SC', ddd: '47' },
]

export function pickBrazilianName(index: number): string {
  const first = FIRST_NAMES[(index * 7) % FIRST_NAMES.length]!
  const last = LAST_NAMES[(index * 13 + Math.floor(index / FIRST_NAMES.length)) % LAST_NAMES.length]!
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

  const suffix = String((10000000 + index * 7919 + index * index) % 100000000).padStart(8, '0')
  return `${location.ddd}9${suffix}`
}
