import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FournisseurAuth } from "./auth/ContexteAuth";
import { RouteProtegee } from "./auth/RouteProtegee";
import { EnTete } from "./components/EnTete";
import { PiedDePage } from "./components/PiedDePage";
import { PageAccueil } from "./pages/PageAccueil";
import { PageCatalogue } from "./pages/PageCatalogue";
import { PageConnexion } from "./pages/PageConnexion";
import { PageDetailFormation } from "./pages/PageDetailFormation";
import { PageEnConstruction as Page } from "./pages/PageEnConstruction";
import { PageEssai } from "./pages/PageEssai";
import { PageInscription } from "./pages/PageInscription";
import { PageQuestionnaire } from "./pages/PageQuestionnaire";
import { PageRecommandations } from "./pages/PageRecommandations";

export default function App() {
  return (
    <BrowserRouter>
      <FournisseurAuth>
        <div className="application">
          <EnTete />
          <Routes>
            <Route path="/" element={<PageAccueil />} />
            <Route path="/formations" element={<PageCatalogue />} />
            <Route path="/formations/:id" element={<PageDetailFormation />} />
            <Route path="/essai" element={<PageEssai />} />
            <Route path="/connexion" element={<PageConnexion />} />
            <Route path="/inscription" element={<PageInscription />} />
            <Route
              path="/questionnaire"
              element={
                <RouteProtegee role="apprenant">
                  <PageQuestionnaire />
                </RouteProtegee>
              }
            />
            <Route
              path="/recommandations"
              element={
                <RouteProtegee role="apprenant">
                  <PageRecommandations />
                </RouteProtegee>
              }
            />
            <Route
              path="/admin"
              element={
                <RouteProtegee role="administrateur">
                  <Page titre="Administration" exigence="RF-04, RF-11" sprint="S6" />
                </RouteProtegee>
              }
            />
            <Route path="*" element={<Page titre="Page introuvable" exigence="—" sprint="—" />} />
          </Routes>
          <PiedDePage />
        </div>
      </FournisseurAuth>
    </BrowserRouter>
  );
}
