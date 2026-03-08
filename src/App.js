import React, {useState} from 'react';
import './App.css';
import { VaultProvider } from './context/VaultContext';
import SearchScreen from './screens/SearchScreen';
import DetailScreen from './screens/DetailScreen';
import VaultScreen from './screens/VaultScreen';

function App() {
  const [screen, setScreen] = useState('search');
  const [selectedSong, setSelectedSong] = useState(null);
  
  // Lift search state to persist across navigation
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const goToDetail = (song) => {
    setSelectedSong(song);
    setScreen('detail');
  };

  return (
    <VaultProvider>
      <div className="app-root">
        <div className="device">
          <div className="device-inner">
            <header className="topbar">
              <button className="back" onClick={() => setScreen('search')}>Back</button>
              <div className="title">{screen === 'search' ? 'LyricSleuth' : screen === 'detail' ? 'Song Details' : 'My Vault'}</div>
              <div className="spacer" />
            </header>

            <main className="content">
              {screen === 'search' && (
                <SearchScreen 
                  onViewDetails={goToDetail}
                  query={query}
                  setQuery={setQuery}
                  results={results}
                  setResults={setResults}
                  searching={searching}
                  setSearching={setSearching}
                />
              )}
              {screen === 'detail' && selectedSong && (
                <DetailScreen song={selectedSong} onBack={() => setScreen('search')} />
              )}
              {screen === 'vault' && (
                <VaultScreen onViewDetails={goToDetail} />
              )}
            </main>

            <nav className="bottombar">
              <button onClick={() => setScreen('search')} className={screen==='search'?'active':''}>Search</button>
              <button onClick={() => setScreen('vault')} className={screen==='vault'?'active':''}>My Vault</button>
            </nav>
          </div>
        </div>
      </div>
    </VaultProvider>
  );
}

export default App;
