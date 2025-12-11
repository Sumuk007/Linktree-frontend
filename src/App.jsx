import { Routes, Route } from 'react-router-dom';
import ProfileEditor from './components/ProfileEditor';
import PublicProfile from './components/PublicProfile';
import AllProfiles from './components/AllProfiles';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProfileEditor />} />
      <Route path="/profiles" element={<AllProfiles />} />
      <Route path="/edit/:slug" element={<ProfileEditor />} />
      <Route path="/u/:slug" element={<PublicProfile />} />
    </Routes>
  );
}

export default App;
