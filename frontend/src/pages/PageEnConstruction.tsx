// Page provisoire : chaque écran est codé au sprint indiqué (docs/planning.md),
// d'après la maquette Figma v2 correspondante.
export function PageEnConstruction({
  titre,
  exigence,
  sprint,
}: {
  titre: string;
  exigence: string;
  sprint: string;
}) {
  return (
    <main className="conteneur page">
      <h1>{titre}</h1>
      <p>
        Écran prévu en {sprint} ({exigence}).
      </p>
    </main>
  );
}
