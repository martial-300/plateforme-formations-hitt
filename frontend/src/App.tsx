import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FournisseurAuth } from "./auth/ContexteAuth";
import { RouteProtegee } from "./auth/RouteProtegee";
import { EnTete } from "./components/EnTete";
import { PageEnConstruction as Page } from "./pages/PageEnConstruction";

export default function App() {
  return (
    <BrowserRouter>
      <FournisseurAuth>
        <EnTete />
        <Routes>
          <Route path="/" element={<Page titre="Catalogue" exigence="RF-05" sprint="S3" />} />
          <Route
            path="/formations/:id"
            element={<Page titre="Détail d'une formation" exigence="RF-05" sprint="S3" />}
          />
          <Route
            path="/essai"
            element={<Page titre="Essayer sans compte" exigence="RF-12" sprint="S5" />}
          />
          <Route
            path="/connexion"
            element={<Page titre="Connexion" exigence="RF-02, RF-13" sprint="S3" />}
          />
          <Route
            path="/inscription"
            element={<Page titre="Inscription" exigence="RF-01, RF-13" sprint="S3" />}
          />
          <Route
            path="/questionnaire"
            element={
              <RouteProtegee role="apprenant">
                <Page titre="Questionnaire" exigence="RF-06, RF-07" sprint="S4" />
              </RouteProtegee>
            }
          />
          <Route
            path="/recommandations"
            element={
              <RouteProtegee role="apprenant">
                <Page titre="Mes recommandations" exigence="RF-08 à RF-10" sprint="S5" />
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
      </FournisseurAuth>
    </BrowserRouter>
  );
}
