# Diagrammes UML

Livrable « Diagrammes UML » du cahier des charges : cas d'utilisation, classes, séquence « obtenir des recommandations ». Les diagrammes sont en [Mermaid](https://mermaid.js.org/) et s'affichent directement sur GitHub.

## 1. Cas d'utilisation

```mermaid
flowchart LR
    V([Visiteur])
    A([Apprenant])
    AD([Administrateur])

    subgraph Système HIT-T Reco
        UC1(Consulter le catalogue)
        UC2(Filtrer par domaine / type)
        UC3(Voir le détail d'une formation)
        UC4(Créer un compte)
        UC5(Se connecter / se déconnecter)
        UC6(Remplir / modifier le questionnaire)
        UC7(Consulter ses recommandations)
        UC8(Donner un retour pertinent / non pertinent)
        UC9(Gérer le catalogue : ajouter, modifier, supprimer)
        UC10(Consulter les chiffres clés)
    end

    V --- UC1 & UC2 & UC3 & UC4
    A --- UC5 & UC6 & UC7 & UC8
    AD --- UC5 & UC9 & UC10
    A -. hérite de .-> V
    UC1 -. extend .- UC2
    UC6 -. include : génère .-> UC7
```

L'apprenant hérite des cas du visiteur. Le rôle Conseiller pédagogique est reporté en V2.

## 2. Classes

```mermaid
classDiagram
    class Utilisateur {
        +UUID id
        +str nom
        +str prenom
        +str email
        -str mot_de_passe_hash
        +Role role
        +datetime date_creation
    }
    class ProfilApprenant {
        +UUID id
        +str niveau_etudes
        +str competences
        +str centres_interet
        +str objectif_professionnel
        +TypeFormation type_souhaite
        +int budget_max_fcfa
        +datetime date_maj
        +texte_moteur() str
    }
    class Formation {
        +UUID id
        +str intitule
        +str description
        +Domaine domaine
        +TypeFormation type
        +float duree_valeur
        +UniteDuree duree_unite
        +int cout_fcfa
        +int cout_promo_fcfa
        +list~str~ mots_cles
        +texte_moteur() str
        +prix_effectif() int
    }
    class Recommandation {
        +UUID id
        +float score
        +list~str~ mots_cles_communs
        +Retour retour
        +datetime date_generation
    }
    class MoteurRecommandation {
        +recommander(profil, formations, k=5) list~Recommandation~
    }
    class Role {
        <<enumeration>>
        apprenant
        administrateur
    }
    class TypeFormation {
        <<enumeration>>
        carte
        modulaire
    }
    class Domaine {
        <<enumeration>>
        SISG
        IA-Data
        TRIT
    }
    class Retour {
        <<enumeration>>
        pertinent
        non_pertinent
        aucun
    }

    Utilisateur "1" -- "0..1" ProfilApprenant
    Utilisateur "1" -- "*" Recommandation
    Formation "1" -- "*" Recommandation
    MoteurRecommandation ..> ProfilApprenant
    MoteurRecommandation ..> Formation
    MoteurRecommandation ..> Recommandation : crée
```

## 3. Séquence « obtenir des recommandations »

```mermaid
sequenceDiagram
    actor A as Apprenant
    participant UI as Frontend React
    participant API as API FastAPI
    participant M as MoteurRecommandation
    participant DB as PostgreSQL

    A->>UI: Remplit le questionnaire et valide
    UI->>API: PUT /api/v1/profil (JWT)
    API->>API: Vérifie le JWT, valide les données
    API->>DB: INSERT ou UPDATE profils_apprenants
    API->>DB: SELECT formations
    DB-->>API: 86 formations
    API->>M: recommander(profil, formations)
    M->>M: TF-IDF + cosinus
    M->>M: Filtre type + budget, top 5, mots-clés communs
    M-->>API: 5 recommandations
    API->>DB: DELETE anciennes recommandations, INSERT 5 nouvelles
    API-->>UI: 200 {profil, recommandations}
    UI-->>A: Affiche le top 5 et les mots-clés
    A->>UI: Clique « pertinent »
    UI->>API: POST /api/v1/recommandations/{id}/retour
    API->>DB: UPDATE recommandations SET retour
    API-->>UI: 200
```
