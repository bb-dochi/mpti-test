# MPTI 데이터 버전 정책

## v1 (기존 약 9,230건)

- Firestore 문서: `statistics/mpti_stats`
- 개발 문서: `statistics/mpti_stats_dev`
- 기존 문항으로 수집한 누적 통계이며 삭제, 재계산, v2 합산을 하지 않는다.

## v2 (문항 수정 이후)

- 운영 누적 통계: `statistics/mpti_stats_v2`
- 개발 누적 통계: `statistics/mpti_stats_v2_dev`
- 운영 개별 응답: `test_responses_v2/{autoId}`
- 개발 개별 응답: `test_responses_v2_dev/{autoId}`

개별 응답에는 `version`, 최종 `result`, 축별 원점수 `scores`, 문항별 `answers` (`questionId`, `type`, `value`), 부가 `tags`, 서버 기준 `completedAt`을 저장한다. 누적 통계와 개별 응답은 한 배치로 기록한다.
