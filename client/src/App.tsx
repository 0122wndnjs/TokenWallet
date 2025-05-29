// TokenWallet/client/src/App.tsx
import React from 'react';
import AppRouter from './routes/AppRouter'; // AppRouter 임포트

const App: React.FC = () => {
  return (
    <div className="App">
      {/* AppRouter 컴포넌트를 렌더링하여 라우팅 설정을 적용합니다. */}
      <AppRouter />
    </div>
  );
};

export default App;