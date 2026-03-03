
async function mockDeleteItem(id: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Deleted item ${id}`;
}

async function mockDeleteBucket(url: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Deleted bucket ${url}`;
}

async function runSequential() {
    const start = Date.now();
    const res1 = await mockDeleteBucket("url");
    const res2 = await mockDeleteItem("id");
    const end = Date.now();
    console.log(`Sequential execution took ${end - start}ms`);
    console.log(`Results: ${res1}, ${res2}`);
}

async function runParallel() {
    const start = Date.now();
    const [res1, res2] = await Promise.all([
        mockDeleteBucket("url"),
        mockDeleteItem("id")
    ]);
    const end = Date.now();
    console.log(`Parallel execution took ${end - start}ms`);
    console.log(`Results: ${res1}, ${res2}`);
}

async function runMissingAwait() {
    const start = Date.now();
    const res = mockDeleteItem("id");
    // @ts-ignore
    console.log(`Missing await result (should be a promise):`, res);
    const end = Date.now();
    console.log(`Unawaited execution "finished" in ${end - start}ms (but work is still pending)`);
}

async function main() {
    console.log("--- Starting Benchmark Simulation ---");
    await runSequential();
    console.log("-------------------------------------");
    await runParallel();
    console.log("-------------------------------------");
    await runMissingAwait();
    console.log("--- Benchmark Simulation Complete ---");
}

main().catch(console.error);
