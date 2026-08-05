export const TEST_VERSION = "v2";

export const getStatisticsDocumentName = () => {
    const environmentSuffix = import.meta.env.DEV ? "_dev" : "";
    return `mpti_stats_${TEST_VERSION}${environmentSuffix}`;
};

export const getResponseCollectionName = () => {
    const environmentSuffix = import.meta.env.DEV ? "_dev" : "";
    return `test_responses_${TEST_VERSION}${environmentSuffix}`;
};
