1. voce deve criar Tipos TypeScript para a model [entidade], segue documentacao das rotas e formato do dado retornado pela api:
    [Documentacao de rotas]
    [Documentacao de formato do dado retornado pela api] // nao entregar o formato correto aqui pode gerar erros no codigo no futuro
    Ver exemplo na entidade de exemplo no arquivo abaixo:
    - src/types/exemplo.types.ts
    checklist:
    - [ ] Criar arquivo `src/types/[entidade].types.ts`
    - [ ] Definir interface da entidade principal (`[Entidade]`)
    - [ ] Definir interface de filtros (`[Entidade]Filter`)
    - [ ] Definir tipos de paginação (`PaginatedResponse`, `PaginationLinks`, `PaginationMeta`)
    - [ ] Definir tipo para autocomplete (`[Entidade]AutocompleteItem`)