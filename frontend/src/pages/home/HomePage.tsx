import styles from "@/pages/home/HomePage.module.css";

const mockResults = [
  {
    name: "r/brasil",
    description: "Comunidade geral com discussoes, noticias e referencias cruzadas.",
    members: "1.400.000 membros",
  },
  {
    name: "r/futebol",
    description: "Topico com mencoes frequentes em debates esportivos e rivalidades.",
    members: "312.000 membros",
  },
  {
    name: "r/gamesEcultura",
    description: "Subreddit ficticio para visualizar como resultados relacionados podem aparecer.",
    members: "89.000 membros",
  },
  {
    name: "r/tecnologiaBR",
    description: "Exemplo de comunidade ligada a analise de grafos, tendencias e dados.",
    members: "156.000 membros",
  },
];

export function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>old.reddit.graph</span>
          <span className={styles.headerTag}>
            Interface de consulta visual para subreddits
          </span>
        </div>
      </header>

      <section className={styles.shell}>
        <div className={styles.titleBar}>
          <h1 className={styles.title}>Pesquisa de Subreddit</h1>
          <p className={styles.subtitle}>
            Digite o nome de um subreddit para visualizar como os resultados
            serao apresentados futuramente.
          </p>
        </div>

        <section className={styles.searchPanel} aria-label="Formulario de pesquisa">
          <label className={styles.label} htmlFor="subreddit-name">
            Nome do subreddit
          </label>

          <div className={styles.searchRow}>
            <input
              className={styles.input}
              id="subreddit-name"
              name="subreddit-name"
              type="text"
              placeholder="Digite o nome do subreddit"
            />
            <button className={styles.button} type="button">
              Pesquisar
            </button>
          </div>

          <p className={styles.helper}>
            Exemplo visual estatico. Nenhuma busca real esta sendo executada.
          </p>
        </section>

        <section className={styles.resultsPanel} aria-label="Resultados simulados">
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Resultados simulados</h2>
            <span className={styles.resultsMeta}>
              4 comunidades ficticias encontradas
            </span>
          </div>

          <ul className={styles.resultList}>
            {mockResults.map((result) => (
              <li className={styles.resultCard} key={result.name}>
                <div className={styles.resultTop}>
                  <h3 className={styles.resultName}>{result.name}</h3>
                  <span className={styles.resultBadge}>{result.members}</span>
                </div>
                <p className={styles.resultDescription}>{result.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
