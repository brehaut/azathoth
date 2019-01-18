/** Wraps up DOMContentLoaded as a promise
 */
function awaitContentLoaded():Promise<void> {
    return new Promise((resolve) => {
        if (document.readyState === "complete") {
            resolve();
        }
        else {
            document.addEventListener("DOMContentLoaded", () => {
                resolve();
            });
        }
    });
}


async function main() {
    await Promise.all([
        awaitContentLoaded()
    ]);

    const coreWorker = new Worker("core.js");
}


main();