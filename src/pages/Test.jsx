import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

import AdFitSmallBanner from "../components/AdFitSmallBanner";

function Test() {
    const navigate = useNavigate();

    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [scores, setScores] = useState({
        weight: { L: 0, H: 0 },
        decision: { I: 0, A: 0 },
        interaction: { P: 0, C: 0 },
        focus: { T: 0, S: 0 },
        tags: [],
    });

    const [history, setHistory] = useState([]);

    const handleBack = () => {
        if (currentIndex === 0) return;

        setCurrentIndex((prev) => prev - 1);

        // 뒤로 가기 시 직전 타임라인의 점수 스냅샷을 완벽히 복원
        const previousScores = history[history.length - 1];
        setScores(previousScores);
        setHistory((prev) => prev.slice(0, -1));
    };

    useEffect(() => {
        const normalQuestions = questions.filter((q) => q.type !== "tag");
        const tagQuestions = questions.filter((q) => q.type === "tag");

        const shuffledNormal = [...normalQuestions];
        for (let i = shuffledNormal.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledNormal[i], shuffledNormal[j]] = [shuffledNormal[j], shuffledNormal[i]];
        }

        setShuffledQuestions([...shuffledNormal, ...tagQuestions]);
    }, []);

    if (shuffledQuestions.length === 0) {
        return <div style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold" }}>[SYSTEM] 퀘스트 카드를 섞는 중...</div>;
    }

    const currentQuestion = shuffledQuestions[currentIndex];

    const handleOptionClick = (type, value, optionIndex) => {
        // 점수판이 바뀌기 직전 상태를 히스토리에 누적 (뒤로가기용)
        setHistory((prev) => [...prev, scores]);

        let extraTags = [];

        // 1~24번 일반 질문 및 25번 태그 질문 분기 점수 업데이트
        if (type === "tag") {
            setScores((prev) => ({
                ...prev,
                tags: [...prev.tags, value, ...extraTags],
            }));
        } else {
            setScores((prev) => ({
                ...prev,
                [type]: { ...prev[type], [value]: prev[type][value] + 1 },
                tags: extraTags.length > 0 ? [...prev.tags, ...extraTags] : prev.tags,
            }));
        }

        // 넥스트 페이지 체크 로직
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // 📌 [버그 수정 완료] 리액트 State 비동기 딜레이 우회를 위해 객체를 즉시 직접 빌드
            const finalScores = {
                ...scores,
                tags: extraTags.length > 0 ? [...scores.tags, ...extraTags] : scores.tags,
            };

            if (type === "tag") {
                finalScores.tags = [...scores.tags, value, ...extraTags];
            } else {
                finalScores[type] = { ...scores[type], [value]: scores[type][value] + 1 };
            }

            // 최종 매칭 알파벳 연산
            const { weight: w, decision: d, interaction: i, focus: f } = finalScores;
            const weight = w.L > w.H ? "L" : "H";
            const decision = d.I > d.A ? "I" : "A";
            const interaction = i.P > i.C ? "P" : "C";
            const focus = f.T > f.S ? "T" : "S";
            const finalResult = `${weight}${decision}${interaction}${focus}`.trim();

            // 통계 데이터 파이어베이스 전송
            const saveStatistics = async () => {
                try {
                    const docName = import.meta.env.DEV ? "mpti_stats_dev" : "mpti_stats";
                    const statsRef = doc(db, "statistics", docName);
                    const updateData = {
                        totalTesters: increment(1),
                        [`types.${finalResult}`]: increment(1),
                    };

                    if (finalScores.tags && finalScores.tags.length > 0) {
                        finalScores.tags.forEach((tag) => {
                            if (tag) {
                                updateData[`extraQuestions.${tag}`] = increment(1);
                            }
                        });
                    }

                    await setDoc(statsRef, updateData, { merge: true });
                    console.log(`🔥 [${docName}] 테스트 완료 시점에 최초 1회 저장 성공!`);
                } catch (error) {
                    console.error("파이어베이스 저장 에러:", error);
                }
            };

            saveStatistics();
            navigate(`/result?c=${finalResult}`, { state: { scores: finalScores } });
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#f4f1ea",
                padding: "20px",
            }}
        >
            <div style={{ maxWidth: "500px", width: "100%", marginTop: "20px" }}>
                <div style={{ width: "100%", marginBottom: "35px" }}>
                    {/* 📌 상단 레이아웃 변경: 왼쪽엔 뒤로가기, 오른쪽엔 진행도 숫자가 양 날개처럼 배치됨 */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between", // 양끝 정렬로 밸런스 유지
                            alignItems: "center",
                            marginBottom: "8px",
                            fontFamily: "'Maplestory-Light', sans-serif",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            color: "#111",
                            padding: "0 4px",
                            minHeight: "28px", // 뒤로가기가 사라져도 높이가 유지되어 들썩거림 방지
                        }}
                    >
                        {/* 👈 좌측 상단 콤팩트한 뒤로가기 아이콘 (첫 질문 땐 안 보임) */}
                        {currentIndex > 0 ? (
                            <div
                                onClick={handleBack}
                                style={{
                                    fontSize: "1.2rem",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "transform 0.1s",
                                    padding: "2px 8px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                            >
                                ⬅️
                            </div>
                        ) : (
                            <div />
                        )}

                        {/* 👉 우측 상단 진행도 스테이터스 */}
                        <span>
                            {currentIndex + 1} / {shuffledQuestions.length}
                        </span>
                    </div>

                    {/* 게이지 트랙 레일 */}
                    <div
                        style={{
                            position: "relative",
                            height: "24px",
                            backgroundColor: "#fff",
                            border: "4px solid #111",
                            borderRadius: "8px",
                            boxShadow: "4px 4px 0px #111",
                            display: "flex",
                            alignItems: "center",
                            overflow: "visible",
                        }}
                    >
                        <div
                            style={{
                                width: `${(currentIndex / (shuffledQuestions.length - 1)) * 100}%`,
                                height: "100%",
                                backgroundColor: "#f1c40f",
                                transition: "width 0.25s ease-out",
                            }}
                        />

                        {/* 미플 말 컴포넌트 */}
                        <div
                            style={{
                                position: "absolute",
                                left: `calc(${(currentIndex / (shuffledQuestions.length - 1)) * 100}% - 14px)`,
                                top: "-12px",
                                fontSize: "1.6rem",
                                transition: "left 0.25s ease-out",
                                zIndex: 2,
                                cursor: "default",
                                userSelect: "none",
                            }}
                        >
                            ♟️
                        </div>

                        <span
                            style={{
                                position: "absolute",
                                right: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "900",
                                color: "#111",
                                fontFamily: "'Maplestory-Light', sans-serif",
                                zIndex: 1,
                            }}
                        >
                            GOAL
                        </span>
                    </div>
                </div>

                {/* 메인 스테이지 질문 카드 */}
                <div
                    style={{
                        backgroundColor: "#fff",
                        border: "4px solid #111",
                        padding: "30px",
                        boxShadow: "8px 8px 0px rgba(0,0,0,0.8)",
                        marginBottom: "30px",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "-15px",
                            left: "20px",
                            backgroundColor: "#3498db",
                            color: "#fff",
                            padding: "5px 15px",
                            border: "2px solid #111",
                            fontWeight: "bold",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        STAGE {currentIndex + 1}
                    </div>
                    <h2
                        style={{
                            fontSize: "1.2rem",
                            textAlign: "center",
                            marginTop: "20px",
                            minHeight: "60px",
                            wordBreak: "keep-all",
                            lineHeight: "1.4",
                            fontFamily: "inherit",
                        }}
                    >
                        {currentQuestion.question}
                    </h2>
                </div>

                {/* 선택 버튼 컴포넌트 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", marginBottom: "25px" }}>
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(currentQuestion.type, option.value, index)}
                            style={{
                                padding: "20px",
                                fontSize: "1.0rem",
                                cursor: "pointer",
                                border: "3px solid #111",
                                backgroundColor: "#fff",
                                textAlign: "left",
                                wordBreak: "keep-all",
                                fontFamily: "inherit",
                                boxShadow: "4px 4px 0px #111",
                                transition: "all 0.1s",
                                lineHeight: "1.4",
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.transform = "translate(4px, 4px)";
                                e.currentTarget.style.boxShadow = "0px 0px 0px #111";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "translate(0px, 0px)";
                                e.currentTarget.style.boxShadow = "4px 4px 0px #111";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translate(0px, 0px)";
                                e.currentTarget.style.boxShadow = "4px 4px 0px #111";
                            }}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>

                {/* 📌 광고 배너가 깔끔하게 최하단 베이스라인을 잡아줌 */}
                <AdFitSmallBanner key="static-test-ad-banner" />
            </div>
        </div>
    );
}

export default Test;
