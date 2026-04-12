import { useState } from "react";

import type {
  SubredditAnalysis,
  SubredditInfluence,
} from "@/entities/subreddit/types";
import styles from "@/pages/home/HomePage.module.css";
import {
  fetchSubredditAnalysis,
  fetchSubredditInfluence,
} from "@/shared/api/subreddit";

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function HomePage() {
  const [subredditName, setSubredditName] = useState("");
  const [influenceDepth, setInfluenceDepth] = useState("2");
  const [analysis, setAnalysis] = useState<SubredditAnalysis | null>(null);
  const [influence, setInfluence] = useState<SubredditInfluence | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [influenceErrorMessage, setInfluenceErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = subredditName.trim();
    const normalizedDepth = Number.parseInt(influenceDepth, 10);

    if (!normalizedName) {
      setAnalysis(null);
      setInfluence(null);
      setErrorMessage("Informe um subreddit para pesquisar.");
      setInfluenceErrorMessage("");
      return;
    }

    if (!Number.isFinite(normalizedDepth) || normalizedDepth < 1) {
      setInfluence(null);
      setInfluenceErrorMessage("Informe uma profundidade valida a partir de 1.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setInfluenceErrorMessage("");

    try {
      const [analysisResult, influenceResult] = await Promise.allSettled([
        fetchSubredditAnalysis(normalizedName),
        fetchSubredditInfluence(normalizedName, normalizedDepth),
      ]);

      if (analysisResult.status === "fulfilled") {
        setAnalysis(analysisResult.value);
      } else {
        setAnalysis(null);
        setErrorMessage(
          analysisResult.reason instanceof Error
            ? analysisResult.reason.message
            : "Nao foi possivel consultar o backend.",
        );
      }

      if (influenceResult.status === "fulfilled") {
        setInfluence(influenceResult.value);
      } else {
        setInfluence(null);
        setInfluenceErrorMessage(
          influenceResult.reason instanceof Error
            ? influenceResult.reason.message
            : "Nao foi possivel consultar a influencia.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel consultar o backend.";

      setAnalysis(null);
      setInfluence(null);
      setErrorMessage(message);
      setInfluenceErrorMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnalysis = analysis !== null;
  const hasInfluence = influence !== null;
  const positivityPercent = hasAnalysis
    ? percentFormatter.format(analysis.positivityRatio * 100)
    : "0,0";
  const negativityPercent = hasAnalysis
    ? percentFormatter.format(
        analysis.totalMentions === 0
          ? 0
          : (analysis.negative / analysis.totalMentions) * 100,
      )
    : "0,0";

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
            Digite o nome de um subreddit para consultar as metricas reais do
            backend.
          </p>
        </div>

        <section className={styles.searchPanel} aria-label="Formulario de pesquisa">
          <label className={styles.label} htmlFor="subreddit-name">
            Nome do subreddit
          </label>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchRow}>
              <input
                className={styles.input}
                id="subreddit-name"
                name="subreddit-name"
                type="text"
                value={subredditName}
                onChange={(event) => setSubredditName(event.target.value)}
                placeholder="Ex.: python"
                autoComplete="off"
              />
              <div className={styles.depthField}>
                <label
                  className={styles.depthLabel}
                  htmlFor="influence-depth"
                >
                  Profundidade BFS
                </label>
                <input
                  className={styles.depthInput}
                  id="influence-depth"
                  name="influence-depth"
                  type="number"
                  min="1"
                  step="1"
                  value={influenceDepth}
                  onChange={(event) => setInfluenceDepth(event.target.value)}
                />
              </div>
              <button
                className={styles.button}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Pesquisando..." : "Pesquisar"}
              </button>
            </div>
          </form>

          <p className={styles.helper}>
            O frontend chama o endpoint <code>/subreddit/{`{name}`}</code> via
            proxy local do Vite.
          </p>
        </section>

        <section className={styles.resultsPanel} aria-label="Resultados da pesquisa">
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Resumo da analise</h2>
            <span className={styles.resultsMeta}>
              {hasAnalysis
                ? `Dados para r/${analysis.subreddit}`
                : "Nenhuma busca executada"}
            </span>
          </div>

          <div className={styles.resultsBody}>
            {isLoading ? (
              <p className={styles.statusMessage} aria-live="polite">
                Consultando backend...
              </p>
            ) : null}

            {!isLoading && errorMessage ? (
              <p className={styles.errorMessage} aria-live="polite">
                {errorMessage}
              </p>
            ) : null}

            {!isLoading && !errorMessage && !hasAnalysis ? (
              <p className={styles.statusMessage}>
                Pesquise um subreddit para exibir os dados agregados do grafo.
              </p>
            ) : null}

            {hasAnalysis ? (
              <>
                <div className={styles.summaryBlock}>
                  <div className={styles.summaryTitleRow}>
                    <h3 className={styles.resultName}>r/{analysis.subreddit}</h3>
                    <span className={styles.resultBadge}>
                      {numberFormatter.format(analysis.totalMentions)} mencoes
                    </span>
                  </div>

                  <p className={styles.resultDescription}>
                    O backend consolida todas as arestas de entrada desse
                    subreddit e calcula mencoes totais, saldo de sentimento e
                    principais comunidades de origem.
                  </p>
                </div>

                <div className={styles.metricGrid}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Mencoes totais</span>
                    <strong className={styles.metricValue}>
                      {numberFormatter.format(analysis.totalMentions)}
                    </strong>
                  </article>

                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Positivas</span>
                    <strong className={styles.metricValue}>
                      {numberFormatter.format(analysis.positive)}
                    </strong>
                  </article>

                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Negativas</span>
                    <strong className={styles.metricValue}>
                      {numberFormatter.format(analysis.negative)}
                    </strong>
                  </article>

                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Taxa positiva</span>
                    <strong className={styles.metricValue}>
                      {positivityPercent}%
                    </strong>
                  </article>
                </div>

                <div className={styles.sentimentPanel}>
                  <div className={styles.sentimentHeader}>
                    <h3 className={styles.sectionTitle}>Leitura de sentimento</h3>
                    <span className={styles.sentimentMeta}>
                      {positivityPercent}% positivo / {negativityPercent}%
                      negativo
                    </span>
                  </div>

                  <div className={styles.sentimentBar} aria-hidden="true">
                    <span
                      className={styles.sentimentPositive}
                      style={{ width: `${analysis.positivityRatio * 100}%` }}
                    />
                    <span
                      className={styles.sentimentNegative}
                      style={{
                        width: `${
                          analysis.totalMentions === 0
                            ? 0
                            : (analysis.negative / analysis.totalMentions) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.sourcesSection}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Top fontes</h3>
                    <span className={styles.sectionMeta}>
                      {analysis.topSources.length} comunidades listadas
                    </span>
                  </div>

                  {analysis.topSources.length > 0 ? (
                    <ul className={styles.sourceList}>
                      {analysis.topSources.map((source, index) => (
                        <li className={styles.sourceItem} key={source.name}>
                          <span className={styles.sourceRank}>#{index + 1}</span>
                          <span className={styles.sourceName}>
                            r/{source.name}
                          </span>
                          <span className={styles.sourceValue}>
                            {numberFormatter.format(source.mentions)} mencoes
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.statusMessage}>
                      Nenhuma fonte de mencao foi encontrada para esse
                      subreddit.
                    </p>
                  )}
                </div>

                <div className={styles.influenceSection}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Mapa de influencia</h3>
                    <span className={styles.sectionMeta}>
                      {hasInfluence
                        ? `${numberFormatter.format(influence.nodesFound)} comunidades em ate ${influence.maxDepth} niveis`
                        : `Busca BFS configurada com profundidade ${influenceDepth}`}
                    </span>
                  </div>

                  <p className={styles.resultDescription}>
                    A BFS percorre os predecessores do subreddit alvo para
                    mostrar quem aponta para ele e em qual nivel da cadeia cada
                    comunidade aparece.
                  </p>

                  {isLoading ? null : influenceErrorMessage ? (
                    <p className={styles.errorMessage} aria-live="polite">
                      {influenceErrorMessage}
                    </p>
                  ) : null}

                  {!isLoading && !influenceErrorMessage && hasInfluence ? (
                    influence.influence.length > 0 ? (
                      <ul className={styles.influenceList}>
                        {influence.influence.map((node, index) => (
                          <li
                            className={styles.influenceItem}
                            key={`${node.name}-${node.depth}-${index}`}
                          >
                            <span className={styles.influenceNode}>
                              r/{node.name}
                            </span>
                            <span className={styles.influenceDepth}>
                              nivel {node.depth}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.statusMessage}>
                        Nenhuma comunidade predecessora foi encontrada para esse
                        subreddit na profundidade informada.
                      </p>
                    )
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
