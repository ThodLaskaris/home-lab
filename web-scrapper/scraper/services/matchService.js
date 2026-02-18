export async function processReceiptMatches(items, grpcClient, config) {
    const uniqueItemsMap = new Map();
    items.forEach(item => {
        const existing = uniqueItemsMap.get(item.name);
        if (existing) {
            existing.quantity += item.quantity;
            existing.totalPrice += item.price;
        } else {
            uniqueItemsMap.set(item.name, { ...item, totalPrice: item.price });
        }
    });

    const uniqueItems = Array.from(uniqueItemsMap.values());

    const report = {
        totalItemsProcessed: uniqueItems.length,
        matches: [],
        rejected: [],
        summaryByCategory: {}
    };

    const matchPromises = uniqueItems.map(item => {
        return new Promise((resolve) => {
            const request = {
                raw_text: item.name,
                source_category: item.category || ''
            };

            grpcClient.MatchReceiptItem(request, (err, response) => {
                if (err || !response || response.score < config.browserOptions.matchScoreThreshold) {
                    report.rejected.push({ name: item.name, reason: err ? err.message : 'Low Score' });
                    return resolve();
                }

                const matchEntry = {
                    originalName: item.name,
                    matchedName: response.matched_with,
                    category: response.category,
                    quantity: item.quantity,
                    price: item.totalPrice,
                    score: response.score
                };

                report.matches.push(matchEntry);
                if (!report.summaryByCategory[response.category]) {
                    report.summaryByCategory[response.category] = 0;
                }
                report.summaryByCategory[response.category] += item.totalPrice;

                console.log(`[${(response.score * 100).toFixed(1)}%] MATCH: ${item.name} -> ${response.matched_with}`);
                resolve();
            });
        });
    });

    await Promise.all(matchPromises);

    return report;
}