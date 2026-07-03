import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { characters } from "../data/characters";

import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [character, setCharacter] = useState(null);
    const [finalResult, setFinalResult] = useState("");
    const [displayTags, setDisplayTags] = useState([]);

    const scores = location.state?.scores;
    const hasRecorded = useRef(false);

    // 1. 진입 경로 분기 (공유 링크 진입 vs 일반 테스트 완료 진입)
    useEffect(() => {
        const charIdFromUrl = searchParams.get("c");

        // 상황 A: 공유 링크(?c=MPTI네글자)로 직접 접속했을 때
        if (charIdFromUrl) {
            const cleanId = charIdFromUrl.trim().toUpperCase();
            const foundCharacter = characters[cleanId];
            if (foundCharacter) {
                setCharacter(foundCharacter);
                setFinalResult(cleanId);
                setDisplayTags(scores?.tags || []);
                return;
            }
        }

        // 상황 B: 일반 테스트 프로세스를 거쳐 정상 진입했을 때
        if (scores) {
            const { weight: w, decision: d, interaction: i, focus: f } = scores;
            const weight = w.L > w.H ? "L" : "H";
            const decision = d.I > d.A ? "I" : "A";
            const interaction = i.P > i.C ? "P" : "C";
            const focus = f.T > f.S ? "T" : "S";
            const calculatedResult = `${weight}${decision}${interaction}${focus}`.trim();

            const matchedCharacter = characters[calculatedResult] || {
                mpti: calculatedResult,
                name: "미등록 미플",
                passive: "데이터 없음",
                description: "로직 오류 혹은 데이터 누락",
                goodMatch: "?",
                badMatch: "?",
            };

            setCharacter(matchedCharacter);
            setFinalResult(calculatedResult);
            setDisplayTags(scores.tags || []);
        }
    }, [scores, searchParams]);

    // 2. 페이지가 열릴 때 딱 한 번 파이어베이스에 데이터 전송하기 (직접 테스트 친 유저만 누적)
    useEffect(() => {
        if (hasRecorded.current || !finalResult || !scores) return;
        hasRecorded.current = true;

        const saveStatistics = async () => {
            try {
                const docName = import.meta.env.DEV ? "mpti_stats_dev" : "mpti_stats";
                const statsRef = doc(db, "statistics", docName);
                const updateData = {
                    totalTesters: increment(1),
                    [`types.${finalResult}`]: increment(1),
                };

                if (scores.tags && scores.tags.length > 0) {
                    scores.tags.forEach((tag) => {
                        if (tag) {
                            updateData[`extraQuestions.${tag}`] = increment(1);
                        }
                    });
                }

                await setDoc(statsRef, updateData, { merge: true });
                console.log(`🔥 [${docName}] 파이어베이스 통계 누적 성공!`);
            } catch (error) {
                console.error("파이어베이스 저장 에러:", error);
            }
        };

        saveStatistics();
    }, [finalResult, scores]);

    // 예외 방어벽
    if (!character && !scores && !searchParams.get("c")) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontWeight: "bold" }}>[ERROR] 데이터를 불러올 수 없습니다.</p>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        border: "3px solid #111",
                        fontWeight: "bold",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    메인으로 복귀
                </button>
            </div>
        );
    }

    if (!character) {
        return <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "'Maplestory-Light', sans-serif", fontWeight: "bold" }}>[SYSTEM] 보드게임 성향 결과 로드 중...</div>;
    }

    // 🔗 주소 정의 (고유 결과 주소 및 메인 주소)
    const shareUrl = `${window.location.origin}/result?c=${finalResult}`;
    const shareTitle = "MPTI - 보드게임 성향 테스트";
    const shareText = `나의 보드게임 자아는 '${character.name}'입니다. 당신의 성향도 분석해 보세요!`;
    const imageUrl = `${window.location.origin}/thumbnail.png`;

    // 1. 공유 카운트 누적 함수
    const incrementShareCount = async () => {
        try {
            const docName = import.meta.env.DEV ? "mpti_stats_dev" : "mpti_stats";
            const statsRef = doc(db, "statistics", docName);
            await setDoc(statsRef, { shareCount: increment(1) }, { merge: true });
            console.log("📈 파이어베이스 공유 카운트 +1 완료");
        } catch (error) {
            console.error("공유 카운트 누적 실패:", error);
        }
    };

    // 2. 테스트 메인 링크 복사 기능 (항상 메인 홈 주소만 복사)
    const handleCopyMainLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.origin);
            alert("테스트 주소가 클립보드에 복사되었습니다! 친구들에게 추천해 보세요.");
            await incrementShareCount();
        } catch (error) {
            alert("링크 복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.");
        }
    };

    // 3. 결과 고유 주소 링크 복사 기능 (모바일 외 환경용 데스크톱 백업 로직)
    const handleCopyResultLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("결과 페이지 링크가 클립보드에 복사되었습니다!");
            await incrementShareCount();
        } catch (error) {
            alert("링크 복사에 실패했습니다.");
        }
    };

    // 4. 결과 공유하기 (모바일 카카오톡 피드 연동)
    const handleShareResult = async () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && typeof window.Kakao !== "undefined" && window.Kakao.isInitialized()) {
            try {
                window.Kakao.Share.sendDefault({
                    objectType: "feed",
                    content: {
                        title: shareTitle,
                        description: shareText,
                        imageUrl: imageUrl,
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    },
                    buttons: [
                        {
                            title: "결과 확인하기 ♟️",
                            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                        },
                        {
                            title: "나도 테스트하기 🎲",
                            link: { mobileWebUrl: window.location.origin, webUrl: window.location.origin },
                        },
                    ],
                });
                await incrementShareCount();
                return;
            } catch (error) {
                console.error("카카오 공유 실패, 링크 복사로 전환:", error);
            }
        }
        // PC 환경이나 카톡이 불가능할 경우 결과 고유 주소 복사로 대응
        handleCopyResultLink();
    };

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
            {/* 캐릭터 카드 UI */}
            <div
                style={{
                    backgroundColor: "#fff",
                    border: "6px solid #111",
                    padding: "30px",
                    maxWidth: "450px",
                    width: "100%",
                    boxShadow: "10px 10px 0px rgba(0,0,0,0.8)",
                    position: "relative",
                    marginBottom: "20px",
                }}
            >
                {/* 상단 MPTI 뱃지 */}
                <div
                    style={{
                        position: "absolute",
                        top: "-20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "#f1c40f",
                        color: "#111",
                        padding: "5px 20px",
                        border: "4px solid #111",
                        fontWeight: "900",
                        fontSize: "1.2rem",
                        letterSpacing: "2px",
                        whiteSpace: "nowrap",
                        boxShadow: "4px 4px 0px #111",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    [ {finalResult} ]
                </div>

                <h1
                    style={{
                        fontSize: "1.6rem",
                        textAlign: "center",
                        margin: "30px 0 20px 0",
                        color: "#111",
                        fontWeight: "900",
                        wordBreak: "keep-all",
                        lineHeight: "1.4",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    {character.name}
                </h1>

                {/* 미플 일러스트 영역 */}
                <div
                    style={{
                        width: "300px",
                        height: "400px",
                        backgroundColor: "#e9e9e9",
                        border: "4px dashed #111",
                        margin: "0 auto 20px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <img
                        src={`/images/${finalResult}.png`}
                        alt={character.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                            e.target.style.display = "none";
                            const placeholder = e.target.parentNode.querySelector(".placeholder-text");
                            if (placeholder) placeholder.style.display = "block";
                        }}
                    />
                    <span className="placeholder-text" style={{ color: "#555", fontWeight: "bold", display: "none" }}>
                        ♟️ [ {finalResult} 일러스트 준비 중 ]
                    </span>
                </div>

                {/* 획득 칭호 */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
                    {displayTags.map((tag, index) => (
                        <span
                            key={index}
                            style={{
                                backgroundColor: "#111",
                                color: "#fff",
                                padding: "6px 12px",
                                border: "2px solid #111",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                fontFamily: "'Maplestory-Light', sans-serif",
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div style={{ height: "3px", backgroundColor: "#111", margin: "20px 0", borderBottom: "2px dashed #ccc" }}></div>

                {/* 스킬 및 설명 */}
                <div style={{ marginBottom: "20px" }}>
                    <strong
                        style={{
                            display: "inline-block",
                            backgroundColor: "#e74c3c",
                            color: "#fff",
                            padding: "4px 8px",
                            border: "2px solid #111",
                            marginBottom: "8px",
                            fontSize: "0.9rem",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        ▶ 패시브 스킬
                    </strong>
                    <p style={{ margin: 0, lineHeight: "1.6", fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{character.passive}</p>
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <strong
                        style={{
                            display: "inline-block",
                            backgroundColor: "#3498db",
                            color: "#fff",
                            padding: "4px 8px",
                            border: "2px solid #111",
                            marginBottom: "8px",
                            fontSize: "0.9rem",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        ▶ 플레이 스타일
                    </strong>
                    <p style={{ margin: 0, lineHeight: "1.6", fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{character.description}</p>
                </div>

                {/* 궁합 영역 */}
                <div style={{ backgroundColor: "#f4f1ea", border: "3px solid #111", padding: "15px" }}>
                    <div style={{ marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", color: "#27ae60" }}>🟢 찰떡 파티원 : </span>
                        <span style={{ fontWeight: "bold" }}>{character.goodMatch}</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: "bold", color: "#c0392b" }}>🔴 상극 파티원 : </span>
                        <span style={{ fontWeight: "bold" }}>{character.badMatch}</span>
                    </div>
                </div>
            </div>

            {/* 1️⃣ 결과 공유하기 버튼 (현재 결과의 ?c= 고유주소가 전송됨) */}
            <button
                onClick={handleShareResult}
                style={{
                    maxWidth: "450px",
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    backgroundColor: "#f9e000",
                    color: "#371d1d",
                    border: "4px solid #111",
                    boxShadow: "4px 4px 0px #111",
                    cursor: "pointer",
                    fontFamily: "inherit",
                }}
            >
                결과 공유하기 🔗
            </button>

            {/* 2️⃣ 테스트 링크 복사 버튼 (언제나 메인 홈 주소 복사) */}
            <button
                onClick={handleCopyMainLink}
                style={{
                    maxWidth: "450px",
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    backgroundColor: "#fff",
                    color: "#111",
                    border: "4px solid #111",
                    boxShadow: "4px 4px 0px #111",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginTop: "12px",
                }}
            >
                테스트 링크 복사 📋
            </button>

            {/* 3️⃣ 나도 테스트하기 / 다시하기 통합 버튼 */}
            <button
                onClick={() => navigate("/")}
                style={{
                    marginTop: "40px",
                    padding: "15px 40px",
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    cursor: "pointer",
                    border: "4px solid #111",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    fontFamily: "'Maplestory-Light', sans-serif",
                    boxShadow: "6px 6px 0px #111",
                    transition: "all 0.1s",
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = "translate(6px, 6px)";
                    e.currentTarget.style.boxShadow = "0px 0px 0px #111";
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translate(0px, 0px)";
                    e.currentTarget.style.boxShadow = "6px 6px 0px #111";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0px, 0px)";
                    e.currentTarget.style.boxShadow = "6px 6px 0px #111";
                }}
            >
                나도 테스트하기 🎲
            </button>
        </div>
    );
}

export default Result;
