import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', 
      backgroundColor: '#2ecc71', // 보드게임 매트 그린
      backgroundImage: 'linear-gradient(#27ae60 2px, transparent 2px), linear-gradient(90deg, #27ae60 2px, transparent 2px)',
      backgroundSize: '40px 40px', // 그리드 패턴
      padding: '20px', fontFamily: '"Courier New", Courier, monospace' // 픽셀/레트로 폰트 느낌
    }}>
      
      {/* 부루마블 중앙 로고 판 느낌의 박스 */}
      <div style={{
        backgroundColor: '#fff',
        border: '6px dashed #111', // 절취선/보드게임 칸 느낌
        padding: '50px 30px',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '10px 10px 0px rgba(0,0,0,0.8)',
        position: 'relative'
      }}>
        
        {/* 장식용 주사위 (CSS로 간단히 구현) */}
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎲♟️</div>

        <h1 style={{ 
          fontSize: '2.5rem', margin: '0 0 15px 0', color: '#111', 
          fontWeight: '900', wordBreak: 'keep-all', lineHeight: '1.2' 
        }}>
          당신은 어떤<br/>미플인가요?
        </h1>

        <p style={{
          fontSize: '1.2rem', color: '#333', marginBottom: '40px', fontWeight: 'bold'
        }}>
          [ M P T I - T E S T ]
        </p>

        {/* 픽셀 게임 시작 버튼 */}
        <button
          onClick={() => navigate('/test')}
          style={{
            backgroundColor: '#e74c3c', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold',
            padding: '15px 0', border: '4px solid #111',
            cursor: 'pointer', width: '100%', fontFamily: 'inherit',
            boxShadow: '6px 6px 0px #111', transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(6px, 6px)';
            e.currentTarget.style.boxShadow = '0px 0px 0px #111';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(0px, 0px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px #111';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0px, 0px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px #111';
          }}
        >
          START GAME ▶
        </button>
      </div>
    </div>
  );
}

export default Home;