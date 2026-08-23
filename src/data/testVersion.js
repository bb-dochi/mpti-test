export const getStatisticsDocumentName = () => {
    const environmentSuffix = import.meta.env.DEV ? "_dev" : "";
    return `mpti_stats${environmentSuffix}`;
};
