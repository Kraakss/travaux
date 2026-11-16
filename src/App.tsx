import { HashRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store'
import { Accueil } from './pages/Accueil'
import { ChantierPage } from './pages/ChantierPage'
import { PiecePage } from './pages/PiecePage'
import { ChoixCategorie } from './pages/ChoixCategorie'
import { SaisieTravail } from './pages/SaisieTravail'
import { DevisPage } from './pages/DevisPage'
import { PrixPage } from './pages/PrixPage'
import { ReglagesPage } from './pages/ReglagesPage'
import { Introuvable } from './ui/Page'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/chantier/:cid" element={<ChantierPage />} />
          <Route path="/chantier/:cid/devis" element={<DevisPage />} />
          <Route path="/chantier/:cid/piece/:pid" element={<PiecePage />} />
          <Route path="/chantier/:cid/piece/:pid/categorie" element={<ChoixCategorie />} />
          <Route path="/chantier/:cid/piece/:pid/nouveau/:cat" element={<SaisieTravail />} />
          <Route path="/chantier/:cid/piece/:pid/travail/:tid" element={<SaisieTravail />} />
          <Route path="/prix" element={<PrixPage />} />
          <Route path="/reglages" element={<ReglagesPage />} />
          <Route path="*" element={<Introuvable quoi="Cette page" />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
