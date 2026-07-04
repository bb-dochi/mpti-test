import { useNavigate } from "react-router-dom";
import { characters } from "../data/characters";

function AllTypes() {
    const navigate = useNavigate();

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
            }}
        >
            <div style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
                {/* 상단 타이틀 */}
                <h1
                    style={{
                        fontSize: "1.8rem",
                        fontWeight: "900",
                        color: "#fff",
                        textShadow: "3px 3px 0px #111",
                        marginBottom: "30px",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    📜 보드게이머(미플) 유형 도감
                </h1>

                {/* 16개 캐릭터 그리드 레이아웃 */}
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
                            {/* 미니 썸네일/일러스트 공간 */}
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

                            {/* MPTI 코드 */}
                            <span
                                style={{ fontSize: "0.75rem", fontWeight: "bold", backgroundColor: "#f1c40f", border: "2px solid #111", padding: "2px 6px", borderRadius: "4px", marginBottom: "5px" }}
                            >
                                {char.id}
                            </span>

                            {/* 이름 */}
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
        </div>
    );
}

export default AllTypes;
