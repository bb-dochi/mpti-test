import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { characters } from "../data/characters";

function AllTypes() {
    const navigate = useNavigate();
    const [showGuide, setShowGuide] = useState(false);

    // 16개 캐릭터 데이터 배열로 변환
    const characterList = Object.keys(characters).map((key) => ({
        id: key,
        ...characters[key],
    }));

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#2ecc71",
                backgroundImage: "linear-gradient(#27ae60 2px, transparent 2px), linear-gradient(90deg, #27ae60 2px, transparent 2px)",
                backgroundSize: "40px 40px",
                padding: "40px 20px",
                position: "relative",
                fontFamily: "'Maplestory-Light', sans-serif",
            }}
        >
            <div style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
                {/* 상단 타이틀 영역 */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
                    <h1
                        style={{
                            fontSize: "1.8rem",
                            fontWeight: "900",
                            color: "#fff",
                            textShadow: "3px 3px 0px #111",
                            margin: 0,
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        📜 보드게이머(미플) 유형 도감
                    </h1>
                    <button
                        onClick={() => setShowGuide(true)}
                        style={{
                            backgroundColor: "#f1c40f",
                            border: "3px solid #111",
                            borderRadius: "50%",
                            width: "32px", // 가로 고정
                            height: "32px", // 세로 고정
                            cursor: "pointer",
                            fontWeight: "900",
                            fontSize: "1.1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "2px 2px 0px #111",
                            fontFamily: "'Maplestory-Light', sans-serif",
                            padding: 0,
                        }}
                    >
                        ?
                    </button>
                </div>

                {/* 16개 캐릭터 통짜 그리드 레이아웃 */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "15px",
                        marginBottom: "40px",
                    }}
                >
                    {characterList.map((char) => (
                        <div
                            key={char.id}
                            onClick={() => navigate(`/result?c=${char.id}`)}
                            style={{
                                backgroundColor: "#fff",
                                border: "4px solid #111",
                                borderRadius: "8px",
                                padding: "15px 10px",
                                boxShadow: "4px 4px 0px #111",
                                cursor: "pointer",
                                transition: "all 0.1s",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translate(-2px, -2px)";
                                e.currentTarget.style.boxShadow = "6px 6px 0px #111";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translate(0px, 0px)";
                                e.currentTarget.style.boxShadow = "4px 4px 0px #111";
                            }}
                        >
                            <div
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    backgroundColor: "#f4f1ea",
                                    border: "2px dashed #111",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <img
                                    src={`/images/${char.id}.png`}
                                    alt={char.name}
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentNode.innerHTML = "♟️";
                                    }}
                                />
                            </div>

                            <span
                                style={{ fontSize: "0.75rem", fontWeight: "bold", backgroundColor: "#f1c40f", border: "2px solid #111", padding: "2px 6px", borderRadius: "4px", marginBottom: "5px" }}
                            >
                                {char.id}
                            </span>

                            <strong style={{ fontSize: "0.95rem", color: "#111", wordBreak: "keep-all", textAlign: "center", lineHeight: "1.2" }}>{char.name}</strong>
                        </div>
                    ))}
                </div>

                {/* 메인으로 돌아가기 버튼 */}
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "12px 30px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        border: "4px solid #111",
                        backgroundColor: "#fff",
                        boxShadow: "4px 4px 0px #111",
                        cursor: "pointer",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    홈으로 가기 🏠
                </button>
            </div>

            {/* 🛑 [이스터에그] 4대 성향 지표 팝업창 모달 */}
            {showGuide && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        zIndex: 999,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            border: "5px solid #111",
                            padding: "25px 20px",
                            maxWidth: "450px",
                            width: "100%",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            boxShadow: "8px 8px 0px rgba(0,0,0,0.5)",
                            position: "relative",
                            textAlign: "left",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.3rem",
                                fontWeight: "900",
                                marginBottom: "20px",
                                textAlign: "center",
                                fontFamily: "'Maplestory-Light', sans-serif",
                            }}
                        >
                            📖 지표 가이드
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "0.85rem", lineHeight: "1.5" }}>
                            <div>
                                <strong style={{ fontSize: "0.95rem", color: "#e74c3c" }}>① 웨이트 (Weight) : 게임의 무게감 & 피로도</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#333", wordBreak: "keep-all" }}>
                                    • <strong>[L]ight:</strong> 가벼운 파티게임, 빠른 템포, 직관적 규칙, 콤팩트한 세팅 선호
                                    <br />• <strong>[H]eavy:</strong> 깊은 전략, 유기적 시스템, 묵직한 두뇌 플레이 선호
                                </p>
                            </div>
                            <div style={{ borderTop: "2px dashed #ccc", paddingTop: "10px" }}>
                                <strong style={{ fontSize: "0.95rem", color: "#2ecc71" }}>② 의사결정 (Decision) : 턴을 풀어가는 방식</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#333", wordBreak: "keep-all" }}>
                                    • <strong>[I]ntuitive:</strong> 직관적 판단, 즉흥적 대응, 운 요소를 즐김, 장고 싫어함
                                    <br />• <strong>[A]nalytical:</strong> 분석과 최적화, 장기 플랜, 수읽기와 깊은 고민 선호
                                </p>
                            </div>
                            <div style={{ borderTop: "2px dashed #ccc", paddingTop: "10px" }}>
                                <strong style={{ fontSize: "0.95rem", color: "#3498db" }}>③ 인터랙션 (Interaction) : 플레이어 간 상호작용</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#333", wordBreak: "keep-all" }}>
                                    • <strong>[P]eaceful:</strong> 각자도생, 내 테크 트리 완성, 심한 경쟁 비선호
                                    <br />• <strong>[C]onflict:</strong> 직접 충돌, 심리전, 영향력 전투 선호
                                </p>
                            </div>
                            <div style={{ borderTop: "2px dashed #ccc", paddingTop: "10px" }}>
                                <strong style={{ fontSize: "0.95rem", color: "#9b59b6" }}>④ 취향 및 테마 (Taste) : 재미를 느끼는 핵심 요소</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#333", wordBreak: "keep-all" }}>
                                    • <strong>[T]heme:</strong> 세계관 몰입, 스토리텔링, 컴포넌트의 감성 중시, 의도 중요
                                    <br />• <strong>[S]system:</strong> 정교한 메커니즘, 기믹의 완성도, 추상전략 선호
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowGuide(false)}
                            style={{
                                display: "block",
                                width: "100%",
                                marginTop: "25px",
                                padding: "10px",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                border: "3px solid #111",
                                backgroundColor: "#e74c3c",
                                color: "#fff",
                                cursor: "pointer",
                                boxShadow: "3px 3px 0px #111",
                                fontFamily: "'Maplestory-Light', sans-serif",
                            }}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllTypes;
